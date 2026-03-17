import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/json-ld";
import { ChatWidget } from "@/components/chat-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru'),
  title: {
    default: "CashPeek — Сравнить займы онлайн на карту | Лучшие МФО 2025",
    template: "%s | CashPeek",
  },
  description: "Сравните условия 8+ проверенных МФО. Займы онлайн на карту под 0% для новых клиентов. Быстрое решение за 5 минут. Высокий процент одобрения.",
  keywords: ["займ онлайн", "мфо", "микрозайм", "займ на карту", "займ без отказа", "срочный займ", "займ под 0"],
  authors: [{ name: "CashPeek" }],
  creator: "CashPeek",
  publisher: "CashPeek",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "CashPeek — Сравнить займы онлайн на карту",
    description: "Сравните условия проверенных МФО. Займы онлайн под 0% для новых клиентов.",
    type: "website",
    locale: "ru_RU",
    siteName: "CashPeek",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru',
  },
  twitter: {
    card: "summary_large_image",
    title: "CashPeek — Сравнить займы онлайн на карту",
    description: "Сравните условия проверенных МФО. Займы онлайн под 0% для новых клиентов.",
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
  verification: {
    // Добавьте при наличии
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Глобальные Schema.org схемы для всех страниц */}
        <OrganizationSchema />
        <WebSiteSchema />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <ChatWidget />
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
