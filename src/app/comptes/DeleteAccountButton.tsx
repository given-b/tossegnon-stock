"use client";

import { useState } from "react";
import { deleteAccount } from "./delete";

export default function DeleteAccountButton({ id }: { id: string }) {
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (!window.confirm("Supprimer définitivement cette fiche et sa photo ?")) return;
    setPending(true);
    await deleteAccount(id);
    setPending(false);
  }

  return (
    <button onClick={onClick} disabled={pending}
      className="w-full border border-red-700 py-2 text-sm font-medium text-red-700 disabled:opacity-60">
      {pending ? "Suppression…" : "Supprimer la fiche"}
    </button>
  );
}
