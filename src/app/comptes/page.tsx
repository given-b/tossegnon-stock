import Link from "next/link";
import Nav from "@/components/Nav";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import PasswordReveal from "./PasswordReveal";
import DeleteAccountButton from "./DeleteAccountButton";

const MAX_EDITS = 2;

export default async function ComptesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const me = await requireUser();
  const { q } = await searchParams;
  const isSuper = me.role === "super_admin";

  let query = db
    .from("accounts")
    .select("id,gmail,tiktok_url,photo_path,edit_count,created_at,created_by")
    .order("created_at", { ascending: false })
    .limit(100);
  if (q) query = query.ilike("gmail", `%${q.replace(/[%_,]/g, "")}%`);
  const { data: accounts } = await query;

  const ids = [...new Set((accounts ?? []).map((a) => a.created_by).filter(Boolean))] as string[];
  const names: Record<string, string> = {};
  if (ids.length) {
    const { data: us } = await db.from("users").select("id,nom").in("id", ids);
    us?.forEach((u) => (names[u.id] = u.nom));
  }

  const photos: Record<string, string> = {};
  const paths = (accounts ?? []).map((a) => a.photo_path);
  if (paths.length) {
    const { data: signed } = await db.storage.from("photos").createSignedUrls(paths, 3600);
    signed?.forEach((s) => {
      if (s.path && s.signedUrl) photos[s.path] = s.signedUrl;
    });
  }

  return (
    <>
      <Nav role={me.role} nom={me.nom} />
      <main className="mx-auto max-w-4xl space-y-4 p-4">
        <h1 className="text-2xl font-semibold">Comptes ({accounts?.length ?? 0})</h1>

        <form className="flex gap-2">
          <input name="q" defaultValue={q ?? ""} placeholder="Rechercher un Gmail"
            className="min-w-0 flex-1 border border-stone-300 bg-white px-3 py-3 text-base" />
          <button className="bg-stone-900 px-4 text-white">OK</button>
        </form>

        {!accounts?.length && <p className="text-stone-600">Aucune fiche trouvée.</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          {accounts?.map((a) => {
            const mine = a.created_by === me.id;
            const left = MAX_EDITS - a.edit_count;

            return (
              <div key={a.id} className="space-y-3 bg-white p-4">
                <div className="flex gap-3">
                  {photos[a.photo_path] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photos[a.photo_path]} alt="Compte TikTok"
                      className="h-20 w-20 shrink-0 rounded-2xl border border-stone-300 object-cover" />
                  )}
                  <div className="min-w-0">
                    <p className="break-all font-medium">{a.gmail}</p>
                    <p className="text-xs text-stone-500">
                      Ajouté par {a.created_by ? names[a.created_by] ?? "—" : "—"} le{" "}
                      {new Date(a.created_at).toLocaleDateString("fr-FR")}
                    </p>
                    {(isSuper || mine) && (
                      <p className={`mt-1 text-xs ${!isSuper && left <= 0 ? "text-red-700" : "text-teal-800"}`}>
                        {isSuper
                          ? `${a.edit_count} modification${a.edit_count > 1 ? "s" : ""} par les admins`
                          : `${Math.min(a.edit_count, MAX_EDITS)}/${MAX_EDITS} modification(s) utilisée(s)`}
                      </p>
                    )}
                  </div>
                </div>

                <PasswordReveal id={a.id} />
                {isSuper && <DeleteAccountButton id={a.id} />}

                <div className="flex gap-2">
                  <a href={a.tiktok_url} target="_blank" rel="noopener noreferrer"
                    className="flex-1 bg-stone-900 py-2 text-center text-sm font-medium text-white">
                    Voir le compte TikTok
                  </a>
                  {isSuper || (mine && left > 0) ? (
                    <Link href={`/comptes/${a.id}/modifier`}
                      className="grid place-items-center rounded-2xl border border-stone-400 px-4 text-sm font-medium">
                      Modifier
                    </Link>
                  ) : mine ? (
                    <span className="grid place-items-center rounded-2xl border border-stone-300 px-3 text-xs text-stone-400">
                      Limite atteinte
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
