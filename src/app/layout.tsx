import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { ReviewProvider } from "@/components/providers/review-provider";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/json-ld";
import { ChatWidget } from "@/components/chat-widget";
import { CookieBanner } from "@/components/shared/cookie-banner";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { YandexMetricaNoscript } from "@/components/analytics/yandex-metrica-noscript";

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
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru'}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: "CashPeek — Сравнение займов онлайн",
      },
    ],
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
    yandex: "b93151bbba0cbdb0",
    // google: "your-google-verification-code",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru',
  },
  other: {
    "theme-color": "#ffffff",
    "color-scheme": "light dark",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
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
        {/* Yandex Webmaster Verification */}
        <meta name="yandex-verification" content="b93151bbba0cbdb0" />
        {/* Глобальные Schema.org схемы для всех страниц */}
        <OrganizationSchema />
        <WebSiteSchema />
        {/* Preconnect для внешних ресурсов */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://mc.yandex.ru" />
        <link rel="preconnect" href="https://yastatic.net" />
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        {/* Manifest для PWA */}
        <link rel="manifest" href="/manifest.json" />
        {/* RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title="CashPeek Blog RSS" href="/rss.xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Google Analytics 4 + Yandex.Metrica */}
        <GoogleAnalytics />
        <YandexMetricaNoscript />
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ReviewProvider>
              {children}
              <ChatWidget />
              <CookieBanner />
              <Toaster position="top-right" richColors />
            </ReviewProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
