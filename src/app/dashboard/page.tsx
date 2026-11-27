import Nav from "@/components/Nav";
import { requireUser } from "@/lib/auth";

export default async function Dashboard() {
  const user = await requireUser();

  return (
    <>
      <Nav role={user.role} nom={user.nom} />
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-semibold">Bonjour {user.nom}</h1>
        <p className="mt-1 text-stone-600">
          Les statistiques des Gmail et des liens TikTok arrivent à l'étape suivante.
        </p>
      </main>
    </>
  );
}
