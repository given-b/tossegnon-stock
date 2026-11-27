import Nav from "@/components/Nav";
import { requireUser } from "@/lib/auth";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function ProfilPage() {
  const me = await requireUser({ allowMustChange: true });

  return (
    <>
      {!me.must_change_password && <Nav role={me.role} nom={me.nom} />}
      <main className="max-w-md mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Mon profil</h1>
        <p className="text-stone-600 break-all">{me.nom} · {me.email}</p>
        {me.must_change_password && (
          <p className="bg-amber-100 border border-amber-400 p-3 text-sm">
            Votre mot de passe est provisoire. Choisissez le vôtre pour continuer.
          </p>
        )}
        <ChangePasswordForm />
      </main>
    </>
  );
}
