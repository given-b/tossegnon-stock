import Nav from "@/components/Nav";
import { requireUser } from "@/lib/auth";
import { avatarUrl } from "@/lib/avatar";
import ChangePasswordForm from "./ChangePasswordForm";
import AvatarForm from "./AvatarForm";

export default async function ProfilPage() {
  const me = await requireUser({ allowMustChange: true });
  const url = await avatarUrl(me.avatar_path);

  return (
    <>
      {!me.must_change_password && <Nav role={me.role} nom={me.nom} />}
      <main className="mx-auto max-w-md space-y-4 p-4">
        <h1 className="text-2xl font-semibold">Mon profil</h1>
        <p className="break-all text-stone-600">{me.nom} · {me.email}</p>
        {me.must_change_password && (
          <p className="rounded-2xl border border-amber-400 bg-amber-100 p-3 text-sm">
            Votre mot de passe est provisoire. Choisissez le vôtre pour continuer.
          </p>
        )}
        <AvatarForm current={url} nom={me.nom} />
        <ChangePasswordForm />
      </main>
    </>
  );
}
