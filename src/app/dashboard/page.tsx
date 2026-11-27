import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logout } from "../login/actions";

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Bonjour {session.nom}</h1>
      <p className="text-stone-600">Rôle : {session.role}</p>
      <form action={logout} className="mt-4">
        <button className="border border-stone-400 px-4 py-2">Déconnexion</button>
      </form>
    </main>
  );
}
