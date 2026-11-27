import Nav from "@/components/Nav";
import { requireUser } from "@/lib/auth";
import NewAccountForm from "./NewAccountForm";

export default async function NouveauPage() {
  const me = await requireUser();

  return (
    <>
      <Nav role={me.role} nom={me.nom} />
      <main className="max-w-md mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Ajouter une fiche</h1>
        <NewAccountForm />
      </main>
    </>
  );
}
