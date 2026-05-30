import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Running Coach - Plans d'Entraînement Intelligents",
  description: "Génère des plans d'entraînement à la course à pied adaptés à ton niveau avec IA",
  openGraph: {
    title: "Running Coach - Plans d'Entraînement Intelligents",
    description: "Génère des plans d'entraînement à la course à pied adaptés à ton niveau avec IA",
    url: "https://running-coach-prototype.vercel.app",
    siteName: "Running Coach",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
          {children}
          <Toaster richColors position="top-center" />
        </main>
      </body>
    </html>
  );
}
