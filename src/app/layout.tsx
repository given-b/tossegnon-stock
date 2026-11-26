import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tossegnon Stock",
  description: "Stockage privé de comptes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-stone-100 text-stone-900 antialiased">{children}</body>
    </html>
  );
}
