import "./globals.css";
import type { Metadata } from "next";
import Effects from "@/components/Effects";

export const metadata: Metadata = {
  title: "Tossegnon Stock",
  description: "Stockage privé de comptes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
        <Effects />
      </body>
    </html>
  );
}
