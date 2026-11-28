"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";

export async function deleteAccount(id: string) {
  const me = await requireSuperAdmin();

  const { data: a } = await db
    .from("accounts")
    .select("gmail,photo_path")
    .eq("id", id)
    .maybeSingle();
  if (!a) return;

  await db.from("accounts").delete().eq("id", id);
  await db.storage.from("photos").remove([a.photo_path]);
  await db.from("activity_logs").insert({
    user_id: me.id,
    action: "suppression_compte",
    target: a.gmail,
  });
  revalidatePath("/comptes");
}
