import Link from "next/link";
import Nav from "@/components/Nav";
import StatCard from "@/components/StatCard";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

async function count(since?: Date) {
  let q = db.from("accounts").select("id", { count: "exact", head: true });
  if (since) q = q.gte("created_at", since.toISOString());
  const { count: c } = await q;
  return c ?? 0;
}

const MAIL = "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6";
const LINK = "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7";
const SUN = "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4";
const CAL = "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18";

export default async function Dashboard() {
  const me = await requireUser();

  const now = new Date();
  const startDay = new Date(now);
  startDay.setUTCHours(0, 0, 0, 0);
  const startMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [total, today, month] = await Promise.all([
    count(),
    count(startDay),
    count(startMonth),
  ]);

  const { count: links } = await db
    .from("accounts")
    .select("id", { count: "exact", head: true })
    .not("tiktok_url", "is", null);

  const { data: all } = await db.from("accounts").select("created_by");
  const perUser: Record<string, number> = {};
  all?.forEach((a) => {
    if (a.created_by) perUser[a.created_by] = (perUser[a.created_by] ?? 0) + 1;
  });
  const uids = Object.keys(perUser);
  const { data: us } = uids.length
    ? await db.from("users").select("id,nom").in("id", uids)
    : { data: [] as { id: string; nom: string }[] };

  const { data: recent } = await db
    .from("accounts")
    .select("id,gmail,created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <>
      <Nav role={me.role} nom={me.nom} />
      <main className="max-w-4xl mx-auto p-4 space-y-5">
        <div>
          <p className="text-sm font-medium text-teal-700">Bienvenue, {me.nom}</p>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Gmail disponibles" value={total} icon={MAIL}
            tint="bg-gradient-to-br from-teal-600 to-teal-400" />
          <StatCard label="Liens TikTok" value={links ?? 0} icon={LINK}
            tint="bg-gradient-to-br from-indigo-500 to-violet-400" />
          <StatCard label="Aujourd'hui" value={today} icon={SUN}
            tint="bg-gradient-to-br from-amber-500 to-orange-400" />
          <StatCard label="Ce mois-ci" value={month} icon={CAL}
            tint="bg-gradient-to-br from-sky-500 to-cyan-400" />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <section className="bg-white p-4">
            <h2 className="mb-2 font-semibold">Ajouts par administrateur</h2>
            {!us?.length && <p className="text-sm text-stone-600">Aucun ajout pour le moment.</p>}
            {us?.map((u) => (
              <div key={u.id}
                className="flex justify-between border-b border-stone-200/70 py-2 text-sm last:border-0">
                <span>{u.nom}</span>
                <span className="rounded-full bg-teal-500/15 px-3 font-medium text-teal-800">
                  {perUser[u.id]}
                </span>
              </div>
            ))}
          </section>

          <section className="bg-white p-4">
            <h2 className="mb-2 font-semibold">Dernières fiches</h2>
            {!recent?.length && <p className="text-sm text-stone-600">Aucune fiche.</p>}
            {recent?.map((r) => (
              <div key={r.id}
                className="flex justify-between gap-2 border-b border-stone-200/70 py-2 text-sm last:border-0">
                <span className="break-all">{r.gmail}</span>
                <span className="shrink-0 text-stone-500">
                  {new Date(r.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
            ))}
          </section>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 to-teal-500 p-6 text-white shadow-xl shadow-teal-700/25">
          <div className="absolute -right-6 -top-6 h-32 w-32 animate-pulse rounded-full bg-white/15" />
          <div className="absolute -bottom-8 right-16 h-24 w-24 rounded-full bg-lime-300/40" />
          <p className="relative text-xs uppercase tracking-wide text-teal-100">Nouvelle fiche</p>
          <p className="relative mt-1 max-w-xs text-xl font-semibold">
            Ajoutez un Gmail avec sa photo et son lien TikTok
          </p>
          <Link href="/comptes/nouveau"
            className="relative mt-4 inline-block rounded-full bg-white/90 px-5 py-2 text-sm font-medium text-teal-800 transition hover:scale-105 hover:bg-white">
            Ajouter une fiche
          </Link>
        </div>
      </main>
    </>
  );
            }
