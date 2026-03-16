/**
 * История поиска
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header, Footer } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Search } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/cabinet/history');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;

    let mounted = true;

    const loadData = async () => {
      try {
        const res = await fetch('/api/user/history');
        const data = await res.json().catch(() => []);
        if (mounted) {
          setHistory(data || []);
        }
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [status, session?.user]);

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
              <FileText className="h-6 w-6 text-primary" />
              История поиска
            </h1>

            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                </CardContent>
              </Card>
            ) : history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item: any) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          {item.query && (
                            <p className="font-medium">"{item.query}"</p>
                          )}
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            {item.amount && <span>{item.amount} ₽</span>}
                            {item.term && <span>{item.term} дней</span>}
                            {item.city && <span>{item.city}</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(item.createdAt).toLocaleString('ru-RU')}
                          </p>
                        </div>
                        {item.resultsCount !== null && (
                          <div className="text-sm text-muted-foreground">
                            {item.resultsCount} результатов
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-lg font-medium mb-2">История пуста</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ваши поисковые запросы будут отображаться здесь
                  </p>
                  <Button asChild>
                    <Link href="/zaimy">Найти займ</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
