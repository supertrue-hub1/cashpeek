/**
 * Мои карты
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header, Footer } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2, Plus, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function CardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/cabinet/cards');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'unauthenticated' || !session) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/cabinet">← Назад в кабинет</Link>
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              Мои карты
            </h1>

            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-lg font-medium mb-2">Нет привязанных карт</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Привяжите карту для быстрого получения займа
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить карту
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
