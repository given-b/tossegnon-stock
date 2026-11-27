import Nav from "@/components/Nav";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import PasswordReveal from "./PasswordReveal";

export default async function ComptesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const me = await requireUser();
  const { q } = await searchParams;

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
      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Comptes ({accounts?.length ?? 0})</h1>

        <form className="flex gap-2">
          <input name="q" defaultValue={q ?? ""} placeholder="Rechercher un Gmail"
            className="flex-1 min-w-0 border border-stone-300 px-3 py-3 text-base bg-white" />
          <button className="bg-stone-900 text-white px-4">OK</button>
        </form>

        {!accounts?.length && <p className="text-stone-600">Aucune fiche trouvée.</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          {accounts?.map((a) => (
            <div key={a.id} className="bg-white border border-stone-300 p-4 space-y-3">
              <div className="flex gap-3">
                {photos[a.photo_path] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photos[a.photo_path]} alt="Compte TikTok"
                    className="h-20 w-20 object-cover border border-stone-300 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-medium break-all">{a.gmail}</p>
                  <p className="text-xs text-stone-500">
                    Ajouté par {a.created_by ? names[a.created_by] ?? "—" : "—"} le{" "}
                    {new Date(a.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>

              <PasswordReveal id={a.id} />

              <a href={a.tiktok_url} target="_blank" rel="noopener noreferrer"
                className="block text-center bg-stone-900 text-white py-2 text-sm font-medium">
                Voir le compte TikTok
              </a>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
