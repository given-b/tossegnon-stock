"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/login/actions";

const ICONS: Record<string, string> = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  plus: "M12 5v14M5 12h14",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  out: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  menu: "M3 6h18M3 12h18M3 18h18",
  clock: "M12 6v6l4 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
};

function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[name]} />
    </svg>
  );
}

function Logo() {
  return (
    <span className="flex items-center gap-2 font-semibold text-teal-900">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-teal-700 to-teal-400 text-white shadow-md">
        T
      </span>
      Tossegnon Stock
    </span>
  );
}

export default function Nav({ role, nom }: { role: string; nom: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "grid" },
    { href: "/comptes", label: "Comptes", icon: "list" },
    { href: "/comptes/nouveau", label: "Ajouter", icon: "plus" },
    ...(role === "super_admin"
      ? [
          { href: "/admins", label: "Administrateurs", icon: "shield" },
          { href: "/journal", label: "Journal", icon: "clock" },
        ]
      : []),
    { href: "/profil", label: "Mon profil", icon: "user" },
  ];

  return (
    <>
      {/* Barre du haut (téléphone) */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-white/70 bg-white/70 px-4 backdrop-blur-xl md:hidden">
        <button onClick={() => setOpen(true)} aria-label="Menu"
          className="grid h-10 w-10 place-items-center rounded-xl text-teal-900">
          <Icon name="menu" />
        </button>
        <Logo />
      </div>

      {/* Fond sombre quand le menu est ouvert */}
      {open && (
        <div onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden" />
      )}

      {/* Menu de gauche */}
      <aside
        className={`app-sidebar fixed left-0 top-0 z-40 flex h-full w-64 flex-col gap-1 border-r border-white/70 bg-white/75 p-4 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 mt-1 px-1">
          <Logo />
        </div>

        <nav className="flex flex-col gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} data-ripple onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-teal-700 to-teal-500 text-white shadow-lg shadow-teal-700/30"
                    : "text-stone-700 hover:translate-x-1 hover:bg-teal-500/10"
                }`}>
                <Icon name={l.icon} />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-3 rounded-2xl bg-teal-500/10 p-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-teal-700 to-teal-400 font-semibold text-white">
              {nom.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{nom}</p>
              <p className="text-xs text-stone-500">
                {role === "super_admin" ? "Super admin" : "Administrateur"}
              </p>
            </div>
          </div>
          <form action={logout}>
            <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-500/10">
              <Icon name="out" />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>
    </>
  );
                     }
