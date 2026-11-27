"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";

export async function login(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const { data: user, error } = await db
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) return { error: "Erreur base : " + error.message };
  if (!user) return { error: "Aucun compte avec cet e-mail : " + email };

  const ok =
    user.statut === "actif" && (await bcrypt.compare(password, user.password_hash));
  if (!ok) return { error: "Mot de passe incorrect pour : " + email };

  await createSession({ id: user.id, role: user.role, nom: user.nom });
  await db.from("activity_logs").insert({ user_id: user.id, action: "connexion" });
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
