"use client";

import { useState } from "react";

type Notif = { id: string; text: string; date: string };

export default function TopBar({
  nom,
  role,
  notifs,
}: {
  nom: string;
  role: string;
  notifs: Notif[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-20 flex items-center gap-3">
      <form action="/comptes" className="relative flex-1">
        <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-700"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          name="q"
          placeholder="Rechercher un Gmail"
          autoCapitalize="none"
          className="w-full rounded-2xl border border-white/80 bg-white/70 py-3 pl-12 pr-4 text-base backdrop-blur-md"
        />
      </form>

      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Notifications"
          className="relative grid h-12 w-12 place-items-center rounded-2xl border border-white/80 bg-white/70 text-teal-800 backdrop-blur-md"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          {notifs.length > 0 && (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500" />
          )}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-72 max-w-[85vw] rounded-2xl border border-white/80 bg-white/90 p-3 shadow-2xl backdrop-blur-xl">
              <p className="mb-2 px-1 text-sm font-semibold">Activité récente</p>
              {!notifs.length && <p className="px-1 py-2 text-sm text-stone-500">Rien pour le moment.</p>}
              {notifs.map((n) => (
                <div key={n.id} className="border-t border-stone-200/70 px-1 py-2 text-sm first:border-0">
                  <p>{n.text}</p>
                  <p className="text-xs text-stone-500">{n.date}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/70 py-2 pl-2 pr-4 backdrop-blur-md">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-teal-700 to-teal-400 font-semibold text-white">
          {nom.charAt(0).toUpperCase()}
        </span>
        <div className="hidden leading-tight sm:block">
          <p className="text-sm font-medium">{nom}</p>
          <p className="text-xs text-stone-500">{role === "super_admin" ? "Super admin" : "Administrateur"}</p>
        </div>
      </div>
    </div>
  );
}
