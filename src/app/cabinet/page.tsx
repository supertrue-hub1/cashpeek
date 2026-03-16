/**
 * Личный кабинет пользователя
 * Tabbed UI с навигацией через URL
 */

import { Suspense } from 'react';
import { Header, Footer } from '@/components/layout';
import { CabinetPageContent } from './CabinetPageContent';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CabinetPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab = typeof params.tab === 'string' ? params.tab : 'overview';

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="flex items-center justify-center py-12">Загрузка...</div>}>
          <CabinetPageContent initialTab={tab} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

