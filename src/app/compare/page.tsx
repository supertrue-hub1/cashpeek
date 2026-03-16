import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Сравнить займы онлайн — выберите лучший займ на карту',
  description: 'Сравните условия займов от проверенных МФО. Найдите лучший займ на карту по ставке, сумме и сроку.',
  redirect: '/sravnit',
};

/**
 * /compare → редирект на /sravnit
 * Это нужно для SEO и удобства пользователей
 */
export default function ComparePage() {
  redirect('/sravnit');
}
