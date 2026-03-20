import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru'

/**
 * Web App Manifest для PWA
 * Доступен по адресу: /manifest.json
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CashPeek — Займы онлайн',
    short_name: 'CashPeek',
    description: 'Сравните условия проверенных МФО. Займы онлайн под 0% для новых клиентов.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'ru',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    categories: ['finance', 'business'],
    screenshots: [
      {
        src: '/screenshots/home.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Главная страница CashPeek',
      },
      {
        src: '/screenshots/mobile.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Мобильная версия CashPeek',
      },
    ],
    shortcuts: [
      {
        name: 'Сравнить займы',
        short_name: 'Сравнить',
        url: '/sravnit',
        icons: [{ src: '/icons/compare.png', sizes: '96x96' }],
      },
      {
        name: 'Все МФО',
        short_name: 'МФО',
        url: '/mfo',
        icons: [{ src: '/icons/mfo.png', sizes: '96x96' }],
      },
      {
        name: 'Блог',
        short_name: 'Блог',
        url: '/blog',
        icons: [{ src: '/icons/blog.png', sizes: '96x96' }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  }
}
