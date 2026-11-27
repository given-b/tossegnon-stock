"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/crypto";
import { requireUser } from "@/lib/auth";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

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

export async function createAccount(formData: FormData) {
  const me = await requireUser();

  const gmail = String(formData.get("gmail") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const tiktok = String(formData.get("tiktok") || "").trim();
  const photo = formData.get("photo");

  if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(gmail)) return { error: "Adresse Gmail invalide." };
  if (!password) return { error: "Le mot de passe est obligatoire." };
  if (!validTiktok(tiktok)) {
    return { error: "Lien TikTok invalide (il doit commencer par https:// et venir de tiktok.com)." };
  }
  if (!(photo instanceof File) || photo.size === 0) return { error: "Photo manquante." };
  if (photo.size > 2 * 1024 * 1024) return { error: "Photo trop lourde (2 Mo max)." };
  const ext = TYPES[photo.type];
  if (!ext) return { error: "Format de photo non accepté (JPG, PNG ou WebP)." };

  const { data: exists } = await db.from("accounts").select("id").eq("gmail", gmail).maybeSingle();
  if (exists) return { error: "Ce Gmail est déjà enregistré." };

  const path = `${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await db.storage
    .from("photos")
    .upload(path, Buffer.from(await photo.arrayBuffer()), { contentType: photo.type });
  if (upErr) return { error: "Envoi de la photo impossible : " + upErr.message };

  const { error } = await db.from("accounts").insert({
    gmail,
    password_enc: encrypt(password),
    photo_path: path,
    tiktok_url: tiktok,
    created_by: me.id,
  });
  if (error) {
    await db.storage.from("photos").remove([path]);
    return { error: error.code === "23505" ? "Ce Gmail est déjà enregistré." : "Enregistrement impossible." };
  }

  await db.from("activity_logs").insert({ user_id: me.id, action: "ajout_compte", target: gmail });
  redirect("/comptes");
}

export async function revealPassword(id: string) {
  const me = await requireUser();
  const { data } = await db.from("accounts").select("gmail,password_enc").eq("id", id).single();
  if (!data) return { error: "Fiche introuvable." };

  await db.from("activity_logs").insert({
    user_id: me.id,
    action: "consultation_mdp",
    target: data.gmail,
  });
  return { password: decrypt(data.password_enc) };
            }
