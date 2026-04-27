import { ClerkProvider } from '@clerk/nextjs'
import Script from 'next/script'
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import VisitTracker from "@/components/VisitTracker";
import SyncUser from "@/components/SyncUser";
import { ToastContainer, ModalContainer } from "@/components/ui/UIOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
    return {
      title: {
        default: settings?.metaTitle || "Tama Arts",
        template: `%s | ${settings?.brandName || "Tama Arts"}`,
      },
      description: settings?.metaDescription || "Artisan Clothing Collection",
      icons: settings?.faviconUrl ? { icon: settings.faviconUrl } : undefined,
    };
  } catch (error) {
    return {
      title: "Tama Arts",
      description: "Artisan Clothing Collection",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col" suppressHydrationWarning>
          <VisitTracker />
          <SyncUser />
          <ToastContainer />
          <ModalContainer />
          {children}
          <Analytics />
          <Script
            src="https://app.sandbox.midtrans.com/snap/snap.js"
            data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
            strategy="beforeInteractive"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
