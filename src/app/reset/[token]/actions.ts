"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function resetPassword(_prev: unknown, formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (password.length < 12) return { error: "12 caractères minimum." };
  if (password !== confirm) return { error: "Les deux mots de passe sont différents." };

  const token_hash = crypto.createHash("sha256").update(token).digest("hex");
  const { data: r } = await db
    .from("password_resets")
    .select("*")
    .eq("token_hash", token_hash)
    .eq("used", false)
    .maybeSingle();

  if (!r || new Date(r.expires_at) < new Date()) {
    return { error: "Lien invalide ou expiré. Refaites une demande." };
  }

  await db
    .from("users")
    .update({ password_hash: await bcrypt.hash(password, 12) })
    .eq("id", r.user_id);
  await db.from("password_resets").update({ used: true }).eq("id", r.id);
  await db.from("activity_logs").insert({ user_id: r.user_id, action: "reset_mdp" });

  return { done: true };
      }
