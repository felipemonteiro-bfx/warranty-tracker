import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { OnboardingTour } from "@/components/shared/OnboardingTour";
import Providers from "@/components/shared/Providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Daily Brief - Top Stories",
  description: "Your daily source for news and updates.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Daily Brief" },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="light" style={{ colorScheme: 'light' }}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <CommandPalette />
          <OnboardingTour />
          {children}
        </Providers>
      </body>
    </html>
  );
}
