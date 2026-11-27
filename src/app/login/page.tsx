"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form action={action} className="w-full max-w-sm bg-white border border-stone-300 p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Connexion</h1>
        <input name="email" type="email" required placeholder="E-mail"
          className="w-full border border-stone-300 px-3 py-3 text-base" />
        <input name="password" type="password" required placeholder="Mot de passe"
          className="w-full border border-stone-300 px-3 py-3 text-base" />
        {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
        <button disabled={pending}
          className="w-full bg-stone-900 text-white py-3 font-medium disabled:opacity-60">
          {pending ? "Connexion…" : "Se connecter"}
        </button>
        <Link href="/forgot" className="block text-center text-sm text-stone-600 underline">
          Mot de passe oublié ?
        </Link>
      </form>
    </main>
  );
}
