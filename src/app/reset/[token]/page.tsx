"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useActionState } from "react";
import { resetPassword } from "./actions";

export default function ResetPage() {
  const { token } = useParams<{ token: string }>();
  const [state, action, pending] = useActionState(resetPassword, null);

  if (state?.done) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border border-stone-300 p-6 space-y-4">
          <h1 className="text-2xl font-semibold">Mot de passe modifié</h1>
          <Link href="/login" className="block bg-stone-900 text-white py-3 text-center font-medium">
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form action={action} className="w-full max-w-sm bg-white border border-stone-300 p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Nouveau mot de passe</h1>
        <input type="hidden" name="token" value={token} />
        <input name="password" type="password" required minLength={12}
          placeholder="Nouveau mot de passe (12 caractères min.)"
          className="w-full border border-stone-300 px-3 py-3 text-base" />
        <input name="confirm" type="password" required minLength={12}
          placeholder="Confirmer le mot de passe"
          className="w-full border border-stone-300 px-3 py-3 text-base" />
        {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
        <button disabled={pending}
          className="w-full bg-stone-900 text-white py-3 font-medium disabled:opacity-60">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </main>
  );
}
