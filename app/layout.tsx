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
  description: "Plataforma para consulta de horários de missas",
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
  ],
  authors: [{ name: "Kawa Missa Team" }],
  creator: "Kawa Missa",
  publisher: "Kawa Missa",
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
    description: "Plataforma para consulta de horários de missas",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kawa Missa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kawa Missa - Gestão Paroquial Simplificada",
    description: "Plataforma para consulta de horários de missas",
    images: ["/og-image.png"],
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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kawa Missa" />
        <meta name="msapplication-TileColor" content="#6c7948" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
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
