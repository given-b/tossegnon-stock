import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { avatarUrl } from "@/lib/avatar";
import NavClient from "./NavClient";

export default async function Nav({ role, nom }: { role: string; nom: string }) {
  let url: string | null = null;
  const s = await getSession();
  if (s) {
    const { data } = await db.from("users").select("avatar_path").eq("id", s.id).maybeSingle();
    url = await avatarUrl(data?.avatar_path);
  }
  return <NavClient role={role} nom={nom} avatarUrl={url} />;
}
