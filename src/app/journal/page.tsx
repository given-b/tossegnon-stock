import Nav from "@/components/Nav";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";

const LABELS: Record<string, string> = {
  connexion: "s'est connecté",
  ajout_compte: "a ajouté une fiche",
  modification_compte: "a modifié une fiche",
  suppression_compte: "a supprimé une fiche",
  consultation_mdp: "a consulté un mot de passe",
  creation_admin: "a créé un administrateur",
  suspension_admin: "a suspendu un administrateur",
  reactivation_admin: "a réactivé un administrateur",
  suppression_admin: "a supprimé un administrateur",
  reset_mdp_admin: "a changé le mot de passe d'un administrateur",
  changement_mdp: "a changé son mot de passe",
  demande_reset_mdp: "a demandé une réinitialisation de mot de passe",
  reset_mdp: "a réinitialisé son mot de passe",
};

export default async function JournalPage() {
  const me = await requireSuperAdmin();

  const { data: logs } = await db
    .from("activity_logs")
    .select("id,user_id,action,target,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: users } = await db.from("users").select("id,nom");
  const names: Record<string, string> = {};
  users?.forEach((u) => (names[u.id] = u.nom));

  return (
    <>
      <Nav role={me.role} nom={me.nom} />
      <main className="mx-auto max-w-4xl space-y-4 p-4">
        <h1 className="text-2xl font-semibold">Journal d&apos;activité</h1>
        <p className="text-sm text-stone-600">Les 100 derniers événements.</p>

        <div className="bg-white p-2">
          {!logs?.length && <p className="p-3 text-sm text-stone-600">Aucun événement.</p>}
          {logs?.map((l) => (
            <div key={l.id}
              className="flex flex-col gap-0.5 border-b border-stone-200/70 p-3 text-sm last:border-0 sm:flex-row sm:justify-between">
              <span>
                <b>{l.user_id ? names[l.user_id] ?? "Utilisateur supprimé" : "Utilisateur supprimé"}</b>{" "}
                {LABELS[l.action] ?? l.action}
                {l.target && <span className="break-all text-stone-500"> · {l.target}</span>}
              </span>
              <span className="shrink-0 text-xs text-stone-500">
                {new Date(l.created_at).toLocaleString("fr-FR")}
              </span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
