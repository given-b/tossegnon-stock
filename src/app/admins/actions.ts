"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";

export async function createAdmin(_prev: unknown, formData: FormData) {
  const me = await requireSuperAdmin();
  const nom = String(formData.get("nom") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (nom.length < 2) return { error: "Nom trop court." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "E-mail invalide." };
  if (password.length < 12) return { error: "Mot de passe provisoire : 12 caractères minimum." };

  const { error } = await db.from("users").insert({
    nom,
    email,
    password_hash: await bcrypt.hash(password, 12),
    role: "admin",
    must_change_password: true,
  });
  if (error) {
    return { error: error.code === "23505" ? "Cet e-mail existe déjà." : "Création impossible." };
  }

  await db.from("activity_logs").insert({
    user_id: me.id,
    action: "creation_admin",
    target: email,
  });
  revalidatePath("/admins");
  return { ok: `Administrateur ${nom} créé. Donnez-lui son mot de passe provisoire.` };
}

export async function toggleAdmin(formData: FormData) {
  const me = await requireSuperAdmin();
  const id = String(formData.get("id") || "");
  const { data: u } = await db.from("users").select("statut,email,role").eq("id", id).single();
  if (!u || u.role !== "admin") return;

  const statut = u.statut === "actif" ? "suspendu" : "actif";
  await db.from("users").update({ statut }).eq("id", id);
  await db.from("activity_logs").insert({
    user_id: me.id,
    action: statut === "suspendu" ? "suspension_admin" : "reactivation_admin",
    target: u.email,
  });
  revalidatePath("/admins");
}

export async function resetAdminPassword(formData: FormData) {
  const me = await requireSuperAdmin();
  const id = String(formData.get("id") || "");
  const password = String(formData.get("password") || "");
  if (password.length < 12) return;

  const { data: u } = await db.from("users").select("email,role").eq("id", id).single();
  if (!u || u.role !== "admin") return;

  await db
    .from("users")
    .update({ password_hash: await bcrypt.hash(password, 12), must_change_password: true })
    .eq("id", id);
  await db.from("activity_logs").insert({
    user_id: me.id,
    action: "reset_mdp_admin",
    target: u.email,
  });
  revalidatePath("/admins");
}

export async function deleteAdmin(formData: FormData) {
  const me = await requireSuperAdmin();
  const id = String(formData.get("id") || "");
  const { data: u } = await db.from("users").select("email,role").eq("id", id).single();
  if (!u || u.role !== "admin") return;

  await db.from("accounts").update({ created_by: null }).eq("created_by", id);
  await db.from("activity_logs").update({ user_id: null }).eq("user_id", id);
  await db.from("users").delete().eq("id", id);
  await db.from("activity_logs").insert({
    user_id: me.id,
    action: "suppression_admin",
    target: u.email,
  });
  revalidatePath("/admins");
}
