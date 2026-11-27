"use client";

import { useActionState } from "react";
import { createAdmin } from "./actions";

export default function CreateAdminForm() {
  const [state, action, pending] = useActionState(createAdmin, null);

  return (
    <form action={action} className="bg-white border border-stone-300 p-4 space-y-3">
      <h2 className="font-semibold">Nouvel administrateur</h2>
      <input name="nom" required placeholder="Nom"
        className="w-full border border-stone-300 px-3 py-3 text-base" />
      <input name="email" type="email" required placeholder="E-mail"
        className="w-full border border-stone-300 px-3 py-3 text-base" />
      <input name="password" type="text" required minLength={12}
        placeholder="Mot de passe provisoire (12 caractères min.)"
        className="w-full border border-stone-300 px-3 py-3 text-base" />
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-800">{state.ok}</p>}
      <button disabled={pending}
        className="w-full bg-stone-900 text-white py-3 font-medium disabled:opacity-60">
        {pending ? "Création…" : "Créer l'administrateur"}
      </button>
    </form>
  );
}
