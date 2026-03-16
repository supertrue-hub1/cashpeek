/**
 * Избранные офферы
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header, Footer } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/cabinet/favorites');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;

    let mounted = true;

    const loadData = async () => {
      try {
        const res = await fetch('/api/user/favorites');
        const data = await res.json().catch(() => []);
        if (mounted) {
          setFavorites(data || []);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
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
              <Heart className="h-6 w-6 text-primary" />
              Избранные офферы
            </h1>

            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                </CardContent>
              </Card>
            ) : favorites.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {favorites.map((fav: any) => (
                  <Card key={fav.id} className="hover:border-primary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{fav.offerId}</h3>
                          {fav.note && (
                            <p className="text-sm text-muted-foreground mt-1">{fav.note}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Добавлено: {new Date(fav.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-lg font-medium mb-2">Нет избранных офферов</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Добавляйте офферы в избранное, чтобы быстро их находить
                  </p>
                  <Button asChild>
                    <Link href="/zaimy">
                      <Plus className="h-4 w-4 mr-2" />
                      Смотреть офферы
                    </Link>
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
