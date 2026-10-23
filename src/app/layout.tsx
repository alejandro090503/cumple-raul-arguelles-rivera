import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes, Marcellus, Dancing_Script } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-ampersand",
  display: "swap",
});

const inter = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Raúl Argüelles Rivera — 50 Años · 2 Enero 2027",
  description: "Celebremos los 50 años de Raúl Argüelles Rivera el sábado 2 de enero de 2027 en Phoenix, Arizona.",
  openGraph: {
    title: "Raúl Argüelles Rivera — 50 Años · 2 Enero 2027",
    description: "Celebremos los 50 años de Raúl Argüelles Rivera el sábado 2 de enero de 2027 en Phoenix, Arizona.",
    siteName: "50 Años · Raúl Argüelles Rivera",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "https://cumple-raul-arguelles-rivera.vercel.app/sobre-og.jpg?v=2",
        width: 1200,
        height: 630,
        alt: "Invitación 50 años Raúl Argüelles Rivera — 2 Enero 2027",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raúl Argüelles Rivera — 50 Años · 2 Enero 2027",
    description: "Celebremos los 50 años de Raúl Argüelles Rivera el sábado 2 de enero de 2027 en Phoenix, Arizona.",
    images: ["https://cumple-raul-arguelles-rivera.vercel.app/sobre-og.jpg?v=2"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${greatVibes.variable} ${dancingScript.variable} ${inter.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
