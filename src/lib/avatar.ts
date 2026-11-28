import { db } from "./db";

export async function avatarUrl(path?: string | null) {
  if (!path) return null;
  const { data } = await db.storage.from("photos").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}
