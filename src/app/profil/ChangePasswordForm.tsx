"use client";

import { useActionState } from "react";
import { changePassword } from "./actions";

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);

  return (
    <form action={action} className="bg-white border border-stone-300 p-4 space-y-3">
      <input name="current" type="password" required placeholder="Mot de passe actuel"
        className="w-full border border-stone-300 px-3 py-3 text-base" />
      <input name="password" type="password" required minLength={12}
        placeholder="Nouveau mot de passe (12 caractères min.)"
        className="w-full border border-stone-300 px-3 py-3 text-base" />
      <input name="confirm" type="password" required minLength={12}
        placeholder="Confirmer le nouveau mot de passe"
        className="w-full border border-stone-300 px-3 py-3 text-base" />
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-800">{state.ok}</p>}
      <button disabled={pending}
        className="w-full bg-stone-900 text-white py-3 font-medium disabled:opacity-60">
        {pending ? "Enregistrement…" : "Changer mon mot de passe"}
      </button>
    </form>
  );
}
