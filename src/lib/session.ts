import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";

const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET!);

export type Session = { id: string; role: "super_admin" | "admin"; nom: string };

export async function createSession(s: Session) {
  const token = await new SignJWT({ ...s })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("2h")
    .sign(secret());
  (await cookies()).set("ts_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7200,
  });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get("ts_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const s = payload as unknown as Session;
    const { data } = await db.from("users").select("statut").eq("id", s.id).maybeSingle();
    if (!data || data.statut !== "actif") return null;
    return s;
  } catch {
    return null;
  }
}

export async function destroySession() {
  (await cookies()).delete("ts_session");
}
