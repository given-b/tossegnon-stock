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

  if (error) return { error: "DEBUG base : " + error.message };
  if (!user) return { error: "DEBUG : aucun compte pour " + email };
  if (user.statut !== "actif") return { error: "DEBUG : compte " + user.statut };

  const good = await bcrypt.compare(password, user.password_hash);
  if (!good) {
    return { error: "DEBUG : mot de passe refusé (longueur saisie : " + password.length + ")" };
  }

  try {
    await createSession({ id: user.id, role: user.role, nom: user.nom });
  } catch (e) {
    return { error: "DEBUG session : " + (e instanceof Error ? e.message : "erreur") };
  }

  await db.from("activity_logs").insert({ user_id: user.id, action: "connexion" });
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
