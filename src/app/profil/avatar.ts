"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadAvatar(formData: FormData) {
  const me = await requireUser({ allowMustChange: true });
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) return { error: "Aucune photo choisie." };
  if (file.size > 1024 * 1024) return { error: "Photo trop lourde." };
  if (!TYPES.includes(file.type)) return { error: "Format non accepté (JPG, PNG ou WebP)." };

  const path = `avatars/${me.id}-${crypto.randomUUID()}.jpg`;
  const { error: upErr } = await db.storage
    .from("photos")
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
  if (upErr) return { error: "Envoi impossible : " + upErr.message };

  const { data: old } = await db.from("users").select("avatar_path").eq("id", me.id).single();
  const { error } = await db.from("users").update({ avatar_path: path }).eq("id", me.id);
  if (error) {
    await db.storage.from("photos").remove([path]);
    return { error: "Enregistrement impossible." };
  }
  if (old?.avatar_path) await db.storage.from("photos").remove([old.avatar_path]);

  await db.from("activity_logs").insert({ user_id: me.id, action: "photo_profil" });
  revalidatePath("/", "layout");
  return { ok: "Photo de profil mise à jour." };
}

export async function removeAvatar() {
  const me = await requireUser({ allowMustChange: true });
  const { data: u } = await db.from("users").select("avatar_path").eq("id", me.id).single();
  if (u?.avatar_path) await db.storage.from("photos").remove([u.avatar_path]);
  await db.from("users").update({ avatar_path: null }).eq("id", me.id);
  revalidatePath("/", "layout");
  return { ok: "Photo supprimée." };
}
