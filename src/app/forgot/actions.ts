"use server";

import crypto from "crypto";
import { Resend } from "resend";
import { db } from "@/lib/db";

export async function forgot(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  const { data: user } = await db
    .from("users")
    .select("id,email")
    .eq("email", email)
    .eq("role", "super_admin")
    .maybeSingle();
  if (!user) return { message: "DEBUG : aucun super admin avec l'e-mail " + email };

  const key = (process.env.RESEND_API_KEY || "").trim();
  if (!key) return { message: "DEBUG : RESEND_API_KEY est vide sur Vercel." };

  await db.from("password_resets").update({ used: true }).eq("user_id", user.id).eq("used", false);

  const token = crypto.randomBytes(32).toString("hex");
  const token_hash = crypto.createHash("sha256").update(token).digest("hex");
  await db.from("password_resets").insert({
    user_id: user.id,
    token_hash,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });

  const base = (process.env.APP_URL || "").trim().replace(/\/+$/, "");
  const link = `${base}/reset/${token}`;

  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: "Tossegnon Stock <onboarding@resend.dev>",
    to: user.email,
    subject: "Réinitialisation de votre mot de passe",
    html: `<p>Vous avez demandé à changer votre mot de passe Tossegnon Stock.</p>
           <p><a href="${link}">Choisir un nouveau mot de passe</a></p>
           <p>Ce lien est valable 30 minutes et ne fonctionne qu'une seule fois.
           Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>`,
  });

  if (error) return { message: "DEBUG Resend : " + error.message };

  await db.from("activity_logs").insert({ user_id: user.id, action: "demande_reset_mdp" });
  return { message: "Si ce compte existe, un e-mail vient d'être envoyé." };
}
