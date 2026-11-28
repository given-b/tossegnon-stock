import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="bg-white p-8 text-center">
        <p className="bg-gradient-to-r from-teal-700 to-teal-400 bg-clip-text text-6xl font-semibold text-transparent">
          404
        </p>
        <p className="mt-2 text-stone-600">Cette page n&apos;existe pas.</p>
        <Link href="/dashboard"
          className="mt-5 inline-block bg-stone-900 px-6 py-3 font-medium text-white">
          Retour au dashboard
        </Link>
      </div>
    </main>
  );
}
