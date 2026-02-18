import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#FF3131",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Azur OS",
  description: "Arquitectura Frontend Experta - Next.js 15 PWA",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icono.ico",
    apple: "/icons/icono.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Azur OS",
  },
  formatDetection: {
    telephone: false,
  },
};

import { PWAInitializer } from "@/components/pwa-initializer";
import { PWAOfflineBanner } from "@/components/pwa-offline-banner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
      </head>
      <body className={`${inter.className} antialiased min-h-screen selection:bg-blue-600/10`}>
        <PWAOfflineBanner />
        <PWAInitializer />
        {children}
      </body>
    </html>
  );
}
