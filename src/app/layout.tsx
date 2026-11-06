import type { Metadata, Viewport } from "next";
import "./globals.css";
import { JsonLd } from "@/components/seo/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://infast.uz";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "InFast IT-Academy — Buloqboshida Zamonaviy IT Kurslari",
    template: "%s | InFast IT-Academy",
  },
  description:
    "InFast IT-Academy — Andijon viloyati Buloqboshi tumanida Frontend, Backend hamda Cyber Security yo‘nalishlarida 100% amaliy loyihalar orqali IT mutaxassisi bo‘ling. Bepul konsultatsiya oling!",
  applicationName: "InFast IT-Academy",
  authors: [{ name: "InFast IT-Academy Team", url: siteUrl }],
  generator: "Next.js",
  keywords: [
    "InFast",
    "InFast Academy",
    "InFast IT Academy",
    "IT kurslar Buloqboshi",
    "IT kurslar Andijon",
    "dasturlashni o'rganish",
    "Frontend kurslari",
    "Backend Python Nodejs",
    "Cyber Security kurslari",
    "Kiberxavfsizlik o'rganish",
    "Next.js va React kurslari",
    "noldan dasturlash",
    "IT ta'lim markazi Buloqboshi",
    "dasturchi bo'lish",
    "IT akademiya O'zbekiston",
  ],
  referrer: "origin-when-cross-origin",
  creator: "InFast IT-Academy",
  publisher: "InFast IT-Academy",
  category: "Education",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "uz-UZ": siteUrl,
    },
  },
  openGraph: {
    title: "InFast IT-Academy — Buloqboshida Zamonaviy IT Kurslari",
    description:
      "Frontend, Backend hamda Cyber Security yo‘nalishlarida real amaliy loyihalar yozib, kuchli portfolio bilan IT sohasiga kiring.",
    url: siteUrl,
    siteName: "InFast IT-Academy",
    locale: "uz_UZ",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "InFast IT-Academy — Zamonaviy IT Kurslari va Amaliy Ta'lim",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InFast IT-Academy — Buloqboshida Zamonaviy IT Kurslari",
    description:
      "Amaliy loyihalarga asoslangan zamonaviy IT ta'limi. Frontend, Backend, Cyber Security.",
    creator: "@infastacademy",
    images: ["/opengraph-image"],
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
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#FF5B00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="scroll-smooth">
      <head>
        <JsonLd />
      </head>
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen selection:bg-infast-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
