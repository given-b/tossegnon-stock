import Link from "next/link";
import { logout } from "@/app/login/actions";

export default function Nav({ role, nom }: { role: string; nom: string }) {
  return (
    <header className="bg-stone-900 text-stone-100">
      <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="font-semibold">Tossegnon Stock</span>
        <nav className="flex flex-wrap gap-4 text-sm">
          <Link href="/dashboard">Dashboard</Link>
          {role === "super_admin" && <Link href="/admins">Administrateurs</Link>}
          <Link href="/profil">Mon profil</Link>
        </nav>
        <form action={logout} className="ml-auto flex items-center gap-3 text-sm">
          <span className="text-stone-400">{nom}</span>
          <button className="border border-stone-500 px-3 py-1">Quitter</button>
        </form>
      </div>
    </header>
  );
}
