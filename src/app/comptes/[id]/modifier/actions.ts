"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { requireUser } from "@/lib/auth";

const MAX_EDITS = 2;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function validTiktok(u: string) {
  try {
    const x = new URL(u);
    return (
      x.protocol === "https:" &&
      (x.hostname === "tiktok.com" || x.hostname.endsWith(".tiktok.com"))
    );
  } catch {
    return false;
  }
}

export async function updateAccount(id: string, formData: FormData) {
  const me = await requireUser();
  const isSuper = me.role === "super_admin";

  const { data: acc } = await db
    .from("accounts")
    .select("id,gmail,tiktok_url,photo_path,edit_count,created_by")
    .eq("id", id)
    .maybeSingle();
  if (!acc) return { error: "Fiche introuvable." };

  if (!isSuper) {
    if (acc.created_by !== me.id) return { error: "Vous ne pouvez modifier que vos propres fiches." };
    if (acc.edit_count >= MAX_EDITS) return { error: "Limite de 2 modifications atteinte pour cette fiche." };
  }

  const gmail = String(formData.get("gmail") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const tiktok = String(formData.get("tiktok") || "").trim();
  const photo = formData.get("photo");

  if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(gmail)) return { error: "Adresse Gmail invalide." };
  if (!validTiktok(tiktok)) {
    return { error: "Lien TikTok invalide (https:// et tiktok.com obligatoires)." };
  }

  const hasPhoto = photo instanceof File && photo.size > 0;
  let ext = "";
  if (hasPhoto) {
    if (photo.size > 2 * 1024 * 1024) return { error: "Photo trop lourde (2 Mo max)." };
    ext = TYPES[photo.type];
    if (!ext) return { error: "Format de photo non accepté (JPG, PNG ou WebP)." };
  }

  const changes: { champ: string; avant: string; apres: string }[] = [];
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (gmail !== acc.gmail) {
    const { data: dup } = await db.from("accounts").select("id").eq("gmail", gmail).maybeSingle();
    if (dup) return { error: "Ce Gmail est déjà enregistré." };
    changes.push({ champ: "Gmail", avant: acc.gmail, apres: gmail });
    patch.gmail = gmail;
  }
  if (password) {
    changes.push({ champ: "Mot de passe", avant: "—", apres: "modifié" });
    patch.password_enc = encrypt(password);
  }
  if (tiktok !== acc.tiktok_url) {
    changes.push({ champ: "Lien TikTok", avant: acc.tiktok_url, apres: tiktok });
    patch.tiktok_url = tiktok;
  }

  let newPath: string | null = null;
  if (hasPhoto) {
    newPath = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await db.storage
      .from("photos")
      .upload(newPath, Buffer.from(await photo.arrayBuffer()), { contentType: photo.type });
    if (upErr) return { error: "Envoi de la photo impossible : " + upErr.message };
    changes.push({ champ: "Photo", avant: "ancienne photo", apres: "nouvelle photo" });
    patch.photo_path = newPath;
  }

  if (!changes.length) return { error: "Aucune modification à enregistrer." };

  if (!isSuper) patch.edit_count = acc.edit_count + 1;

  let q = db.from("accounts").update(patch).eq("id", id);
  if (!isSuper) q = q.eq("edit_count", acc.edit_count);
  const { data: done, error } = await q.select("id");

  if (error || !done?.length) {
    if (newPath) await db.storage.from("photos").remove([newPath]);
    return { error: "Modification impossible ou déjà enregistrée. Rechargez la page." };
  }
  if (newPath) await db.storage.from("photos").remove([acc.photo_path]);

  await db.from("activity_logs").insert({
    user_id: me.id,
    action: "modification_compte",
    target: gmail,
    details: { champs: changes.map((c) => c.champ) },
  });

  if (!isSuper) {
    const { data: sa } = await db.from("users").select("email").eq("role", "super_admin").maybeSingle();
    const to = sa?.email || process.env.SUPER_ADMIN_EMAIL;
    if (to) {
      const reste = MAX_EDITS - (acc.edit_count + 1);
      const rows = changes
        .map(
          (c) =>
            `<tr><td style="padding:6px;border:1px solid #ddd"><b>${esc(c.champ)}</b></td>
             <td style="padding:6px;border:1px solid #ddd">${esc(c.avant)}</td>
             <td style="padding:6px;border:1px solid #ddd">${esc(c.apres)}</td></tr>`
        )
        .join("");
      try {
        const resend = new Resend((process.env.RESEND_API_KEY || "").trim());
        const { error: mailErr } = await resend.emails.send({
          from: "Tossegnon Stock <onboarding@resend.dev>",
          to,
          subject: `Fiche modifiée par ${me.nom}`,
          html: `<p><b>${esc(me.nom)}</b> a modifié la fiche <b>${esc(acc.gmail)}</b>.</p>
                 <p>Date : ${new Date().toLocaleString("fr-FR", { timeZone: "UTC" })} (UTC)</p>
                 <table style="border-collapse:collapse">
                   <tr><th style="padding:6px;border:1px solid #ddd">Champ</th>
                   <th style="padding:6px;border:1px solid #ddd">Avant</th>
                   <th style="padding:6px;border:1px solid #ddd">Après</th></tr>
                   ${rows}
                 </table>
                 <p>Modifications restantes pour cette fiche : ${reste}/${MAX_EDITS}.</p>`,
        });
        if (mailErr) console.error("Erreur e-mail modification :", mailErr.message);
      } catch (e) {
        console.error("Erreur e-mail modification :", e);
      }
    }
  }

  redirect("/comptes");
                  }
