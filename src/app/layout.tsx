import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "INFAST IT-ACADEMY CRM",
  description: "IT Ta'lim Markazi Boshqaruv Tizimi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className="font-sans bg-slate-100 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 antialiased min-h-screen transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
