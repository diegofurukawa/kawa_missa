import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#6c7948",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "Kawa Missa - Gestão Paroquial Simplificada",
    template: "%s | Kawa Missa",
  },
  description:
    "Plataforma para consulta e gestão de horários de missas. Encontre as celebrações da sua paróquia de forma simples e rápida.",
  applicationName: "Kawa Missa",
  keywords: [
    "missa",
    "paróquia",
    "horários de missa",
    "católica",
    "liturgia",
    "gestão paroquial",
    "igreja",
    "comunidade religiosa",
    "celebração",
    "horários",
    "agenda paroquial",
  ],
  authors: [{ name: "Kawa Missa Team" }],
  creator: "Kawa Missa",
  publisher: "Kawa Missa",
  category: "religion",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Kawa Missa",
    title: "Kawa Missa - Gestão Paroquial Simplificada",
    description:
      "Plataforma para consulta e gestão de horários de missas. Encontre as celebrações da sua paróquia de forma simples e rápida.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kawa Missa - Gestão Paroquial Simplificada",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@kawamissa",
    creator: "@kawamissa",
    title: "Kawa Missa - Gestão Paroquial Simplificada",
    description:
      "Plataforma para consulta e gestão de horários de missas. Encontre as celebrações da sua paróquia.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kawa Missa - Gestão Paroquial Simplificada",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileImage": "/icons/icon-144x144.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Kawa Missa",
    description:
      "Plataforma para consulta e gestão de horários de missas. Encontre as celebrações da sua paróquia de forma simples e rápida.",
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    applicationCategory: "ReligionApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
    },
    inLanguage: "pt-BR",
    image: "/og-image.png",
    screenshot: "/og-image.png",
  };

  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kawa Missa" />
        <meta name="msapplication-TileColor" content="#6c7948" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="mask-icon" href="/icons/icon-512x512.png" color="#6c7948" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
