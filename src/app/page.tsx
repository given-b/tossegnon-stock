import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-semibold">Tossegnon Stock</h1>
      <p className="mt-3 max-w-md text-stone-600">
        Espace privé de stockage des comptes. Accès réservé aux administrateurs.
      </p>
      <Link href="/login" className="mt-8 bg-stone-900 text-white px-6 py-3 font-medium">
        Se connecter
      </Link>
    </main>
  );
}
