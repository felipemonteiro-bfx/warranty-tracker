import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { OnboardingTour } from "@/components/shared/OnboardingTour";
import Providers from "@/components/shared/Providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Guardião de Notas - Gestão Inteligente de Garantias e Patrimônio",
    template: "%s | Guardião de Notas"
  },
  description: "A maior plataforma de inteligência e gestão de garantias do Brasil. Proteja seu patrimônio com tecnologia de ponta, análise automática de notas fiscais, alertas inteligentes e integração com seguradoras.",
  keywords: ["garantias", "patrimônio", "notas fiscais", "gestão de bens", "proteção patrimonial", "LGPD", "segurança de dados", "marketplace", "seguros"],
  authors: [{ name: "Guardião de Notas" }],
  creator: "Guardião de Notas Tecnologia S.A.",
  publisher: "Guardião de Notas Tecnologia S.A.",
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: { 
    capable: true, 
    statusBarStyle: "default", 
    title: "Guardião",
    startupImage: [
      {
        url: "https://lh3.googleusercontent.com/gg-dl/AOI_d_9yfHBtXafzC8T3snFo7GdIXq6HQDLrt7Z5UxvjYWabsrwlj0P8aBncqzU2Ovv-1swtO5xi4N4ASTShjz3534eDjmZkVM-5XpKtkgZOgKZCfKpV3R-f4L2vd4ROx6xEZznyzv0oVwwV508ew19R7APwkVR_qqSSXJtDnNWguraFqE-xLQ=s1024-rj",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
      }
    ]
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://guardiaonotas.com.br",
    siteName: "Guardião de Notas",
    title: "Guardião de Notas - Gestão Inteligente de Garantias",
    description: "A maior plataforma de inteligência e gestão de garantias do Brasil. Proteja seu patrimônio com tecnologia de ponta.",
    images: [
      {
        url: "https://lh3.googleusercontent.com/gg-dl/AOI_d_9yfHBtXafzC8T3snFo7GdIXq6HQDLrt7Z5UxvjYWabsrwlj0P8aBncqzU2Ovv-1swtO5xi4N4ASTShjz3534eDjmZkVM-5XpKtkgZOgKZCfKpV3R-f4L2vd4ROx6xEZznyzv0oVwwV508ew19R7APwkVR_qqSSXJtDnNWguraFqE-xLQ=s1024-rj",
        width: 1200,
        height: 630,
        alt: "Guardião de Notas - Logo",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guardião de Notas - Gestão Inteligente de Garantias",
    description: "A maior plataforma de inteligência e gestão de garantias do Brasil.",
    images: ["https://lh3.googleusercontent.com/gg-dl/AOI_d_9yfHBtXafzC8T3snFo7GdIXq6HQDLrt7Z5UxvjYWabsrwlj0P8aBncqzU2Ovv-1swtO5xi4N4ASTShjz3534eDjmZkVM-5XpKtkgZOgKZCfKpV3R-f4L2vd4ROx6xEZznyzv0oVwwV508ew19R7APwkVR_qqSSXJtDnNWguraFqE-xLQ=s1024-rj"],
  },
  verification: {
    google: "verification_token_here",
  },
};

export const viewport: Viewport = { 
  themeColor: "#059669", 
  width: "device-width", 
  initialScale: 1, 
  maximumScale: 5, 
  userScalable: true,
  viewportFit: "cover"
};

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
