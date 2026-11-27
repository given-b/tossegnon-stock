import { redirect } from "next/navigation";
import { getSession } from "./session";
import { db } from "./db";

export async function requireUser(opts?: { allowMustChange?: boolean }) {
  const s = await getSession();
  if (!s) redirect("/login");

  const { data } = await db
    .from("users")
    .select("id,nom,email,role,must_change_password")
    .eq("id", s.id)
    .single();
  if (!data) redirect("/login");

  if (data.must_change_password && !opts?.allowMustChange) redirect("/profil");
  return data;
}

export async function requireSuperAdmin() {
  const u = await requireUser();
  if (u.role !== "super_admin") redirect("/dashboard");
  return u;
}
