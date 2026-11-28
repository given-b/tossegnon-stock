import Nav from "@/components/Nav";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import CreateAdminForm from "./CreateAdminForm";
import { toggleAdmin, resetAdminPassword, deleteAdmin } from "./actions";

export default async function AdminsPage() {
  const me = await requireSuperAdmin();
  const { data: admins } = await db
    .from("users")
    .select("id,nom,email,statut,created_at")
    .eq("role", "admin")
    .order("created_at", { ascending: false });

  return (
    <>
      <Nav role={me.role} nom={me.nom} />
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-semibold">Administrateurs</h1>
        <CreateAdminForm />

        <section className="space-y-3">
          <h2 className="font-semibold">Liste ({admins?.length ?? 0})</h2>
          {!admins?.length && <p className="text-stone-600">Aucun administrateur pour le moment.</p>}

          {admins?.map((a) => (
            <div key={a.id} className="bg-white p-4 space-y-3">
              <div>
                <p className="font-medium">{a.nom}</p>
                <p className="text-sm text-stone-600 break-all">{a.email}</p>
                <p className={`text-sm ${a.statut === "actif" ? "text-green-800" : "text-red-700"}`}>
                  {a.statut === "actif" ? "Actif" : "Suspendu"}
                </p>
              </div>

              <form action={toggleAdmin}>
                <input type="hidden" name="id" value={a.id} />
                <button className="border border-stone-400 px-4 py-2 text-sm">
                  {a.statut === "actif" ? "Suspendre" : "Réactiver"}
                </button>
              </form>

              <form action={resetAdminPassword} className="flex gap-2">
                <input type="hidden" name="id" value={a.id} />
                <input name="password" type="text" required minLength={12}
                  placeholder="Nouveau mot de passe provisoire"
                  className="flex-1 min-w-0 border border-stone-300 px-3 py-2 text-base" />
                <button className="border border-stone-400 px-3 py-2 text-sm">Changer</button>
              </form>

              <form action={deleteAdmin}>
                <input type="hidden" name="id" value={a.id} />
                <button className="border border-red-700 text-red-700 px-4 py-2 text-sm">
                  Supprimer
                </button>
              </form>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
