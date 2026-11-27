import Link from "next/link";
import Nav from "@/components/Nav";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

async function count(since?: Date, onlyLinks = false) {
  let q = db.from("accounts").select("id", { count: "exact", head: true });
  if (since) q = q.gte("created_at", since.toISOString());
  if (onlyLinks) q = q.not("tiktok_url", "is", null);
  const { count: c } = await q;
  return c ?? 0;
}

export default async function Dashboard() {
  const me = await requireUser();

  const now = new Date();
  const startDay = new Date(now);
  startDay.setUTCHours(0, 0, 0, 0);
  const startMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [total, links, today, month] = await Promise.all([
    count(),
    count(undefined, true),
    count(startDay),
    count(startMonth),
  ]);

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

  const Card = ({ label, value }: { label: string; value: number }) => (
    <div className="bg-white border border-stone-300 p-4">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm text-stone-600">{label}</p>
    </div>
  );

  return (
    <>
      <Nav role={me.role} nom={me.nom} />
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-semibold">Bonjour {me.nom}</h1>

        <div className="grid grid-cols-2 gap-3">
          <Card label="Gmail disponibles" value={total} />
          <Card label="Liens TikTok associés" value={links} />
          <Card label="Ajoutés aujourd'hui" value={today} />
          <Card label="Ajoutés ce mois-ci" value={month} />
        </div>

        <section className="bg-white border border-stone-300 p-4">
          <h2 className="font-semibold mb-2">Ajouts par administrateur</h2>
          {!us?.length && <p className="text-sm text-stone-600">Aucun ajout pour le moment.</p>}
          {us?.map((u) => (
            <div key={u.id} className="flex justify-between py-1 text-sm border-b border-stone-200 last:border-0">
              <span>{u.nom}</span>
              <span className="font-medium">{perUser[u.id]}</span>
            </div>
          ))}
        </section>

        <section className="bg-white border border-stone-300 p-4">
          <h2 className="font-semibold mb-2">Dernières fiches</h2>
          {!recent?.length && <p className="text-sm text-stone-600">Aucune fiche.</p>}
          {recent?.map((r) => (
            <div key={r.id} className="flex justify-between gap-2 py-1 text-sm border-b border-stone-200 last:border-0">
              <span className="break-all">{r.gmail}</span>
              <span className="text-stone-500 shrink-0">
                {new Date(r.created_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
          ))}
        </section>

        <Link href="/comptes/nouveau" className="block text-center bg-stone-900 text-white py-3 font-medium">
          Ajouter une fiche
        </Link>
      </main>
    </>
  );
}
