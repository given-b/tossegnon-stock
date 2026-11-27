"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function changePassword(_prev: unknown, formData: FormData) {
  const me = await requireUser({ allowMustChange: true });
  const current = String(formData.get("current") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (password.length < 12) return { error: "12 caractères minimum." };
  if (password !== confirm) return { error: "Les deux mots de passe sont différents." };

  const { data: u } = await db.from("users").select("password_hash").eq("id", me.id).single();
  if (!u || !(await bcrypt.compare(current, u.password_hash))) {
    return { error: "Mot de passe actuel incorrect." };
  }

  await db
    .from("users")
    .update({ password_hash: await bcrypt.hash(password, 12), must_change_password: false })
    .eq("id", me.id);
  await db.from("activity_logs").insert({ user_id: me.id, action: "changement_mdp" });
  return { ok: "Mot de passe modifié." };
}
