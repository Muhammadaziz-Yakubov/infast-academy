import type { Metadata, Viewport } from "next";
import "./globals.css";
import { JsonLd } from "@/components/seo/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://infast.uz";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "InFast IT-Academy — Toshkent va Urganchda Zamonaviy IT Kurslari",
    template: "%s | InFast IT-Academy",
  },
  description:
    "InFast IT-Academy — Toshkent va Urganch shaharlarida Frontend, Backend hamda Cyber Security yo‘nalishlarida 100% amaliy loyihalar orqali IT mutaxassisi bo‘ling. Bepul konsultatsiya oling!",
  applicationName: "InFast IT-Academy",
  authors: [{ name: "InFast IT-Academy Team", url: siteUrl }],
  generator: "Next.js",
  keywords: [
    "InFast",
    "InFast Academy",
    "InFast IT Academy",
    "IT kurslar Toshkent",
    "IT kurslar Urganch",
    "dasturlashni o'rganish",
    "Frontend kurslari",
    "Backend Python Nodejs",
    "Cyber Security kurslari",
    "Kiberxavfsizlik o'rganish",
    "Next.js va React kurslari",
    "noldan dasturlash",
    "IT ta'lim markazi Toshkent",
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
    title: "InFast IT-Academy — Toshkent va Urganchda Zamonaviy IT Kurslari",
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
    title: "InFast IT-Academy — Toshkent va Urganchda Zamonaviy IT Kurslari",
    description:
      "Real amaliy loyihalar orqali dasturchi bo‘ling va kuchli portfolio yaratgan holda IT sohasiga kiring.",
    creator: "@infast_academy",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/icon",
  },
  manifest: "/manifest.webmanifest",
  verification: {
    google: "google-site-verification-placeholder",
    yandex: "yandex-verification-placeholder",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <JsonLd />
      </head>
      <body className="font-sans bg-slate-100 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 antialiased min-h-screen transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}

