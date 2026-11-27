"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgot } from "./actions";

export default function ForgotPage() {
  const [state, action, pending] = useActionState(forgot, null);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form action={action} className="w-full max-w-sm bg-white border border-stone-300 p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Mot de passe oublié</h1>
        <p className="text-sm text-stone-600">
          Entrez l'e-mail du super admin. Un lien de réinitialisation y sera envoyé.
        </p>
        <input name="email" type="email" required placeholder="E-mail"
          className="w-full border border-stone-300 px-3 py-3 text-base" />
        {state?.message && <p className="text-sm text-green-800">{state.message}</p>}
        <button disabled={pending}
          className="w-full bg-stone-900 text-white py-3 font-medium disabled:opacity-60">
          {pending ? "Envoi…" : "Envoyer le lien"}
        </button>
        <Link href="/login" className="block text-center text-sm text-stone-600 underline">
          Retour à la connexion
        </Link>
      </form>
    </main>
  );
}
