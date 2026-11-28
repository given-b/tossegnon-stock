import { notFound, redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import EditAccountForm from "./EditAccountForm";

const MAX_EDITS = 2;

export default async function ModifierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requireUser();
  const { id } = await params;

  const { data: a } = await db
    .from("accounts")
    .select("id,gmail,tiktok_url,photo_path,edit_count,created_by")
    .eq("id", id)
    .maybeSingle();
  if (!a) notFound();

  const isSuper = me.role === "super_admin";
  if (!isSuper && a.created_by !== me.id) redirect("/comptes");
  const left = isSuper ? null : MAX_EDITS - a.edit_count;
  if (left !== null && left <= 0) redirect("/comptes");

  const { data: signed } = await db.storage.from("photos").createSignedUrl(a.photo_path, 3600);

  return (
    <>
      <Nav role={me.role} nom={me.nom} />
      <main className="mx-auto max-w-md space-y-4 p-4">
        <h1 className="text-2xl font-semibold">Modifier la fiche</h1>
        {left !== null && (
          <p className="rounded-2xl border border-amber-400 bg-amber-100/80 p-3 text-sm">
            Il vous reste <b>{left}</b> modification{left > 1 ? "s" : ""} sur {MAX_EDITS} pour cette fiche.
            Chaque modification est signalée par e-mail au super admin.
          </p>
        )}
        <EditAccountForm
          id={a.id}
          gmail={a.gmail}
          tiktok={a.tiktok_url}
          photoUrl={signed?.signedUrl ?? null}
          left={left}
        />
      </main>
    </>
  );
}
