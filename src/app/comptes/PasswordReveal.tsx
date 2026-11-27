"use client";

import { useState } from "react";
import { revealPassword } from "./actions";

export default function PasswordReveal({ id }: { id: string }) {
  const [pwd, setPwd] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function show() {
    if (pwd) {
      setPwd(null);
      return;
    }
    const r = await revealPassword(id);
    if ("password" in r && r.password) setPwd(r.password);
    else setMsg("Erreur");
  }

  async function copy() {
    const r = await revealPassword(id);
    if ("password" in r && r.password) {
      await navigator.clipboard.writeText(r.password);
      setMsg("Copié");
      setTimeout(() => setMsg(""), 2000);
    }
  }

  return (
    <div className="space-y-1">
      <p className="font-mono text-sm break-all">{pwd ?? "••••••••••"}</p>
      <div className="flex items-center gap-2">
        <button onClick={show} className="border border-stone-400 px-3 py-1 text-sm">
          {pwd ? "Masquer" : "Afficher"}
        </button>
        <button onClick={copy} className="border border-stone-400 px-3 py-1 text-sm">
          Copier
        </button>
        {msg && <span className="text-sm text-green-800">{msg}</span>}
      </div>
    </div>
  );
      }
