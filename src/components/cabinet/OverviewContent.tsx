'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, FileText, Plus, Loader2, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

interface OverviewStats {
  favoritesCount: number;
  historyCount: number;
  recentFavorites: any[];
  recentHistory: any[];
}

export function OverviewContent() {
  const [stats, setStats] = useState<OverviewStats>({
    favoritesCount: 0,
    historyCount: 0,
    recentFavorites: [],
    recentHistory: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [favRes, histRes] = await Promise.all([
          fetch('/api/user/favorites'),
          fetch('/api/user/history'),
        ]);

        if (!mounted) return;

        const [favData, histData] = await Promise.all([
          favRes.json().catch(() => []),
          histRes.json().catch(() => []),
        ]);

        const favorites = favData || [];
        const history = histData || [];

        setStats({
          favoritesCount: favorites.length,
          historyCount: history.length,
          recentFavorites: favorites.slice(0, 3),
          recentHistory: history.slice(0, 3),
        });
      } catch (error) {
        console.error('Error loading overview data:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Heart className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.favoritesCount}</p>
                <p className="text-xs text-muted-foreground">Избранных</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.historyCount}</p>
                <p className="text-xs text-muted-foreground">Поисков</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Просмотров</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">5 мин</p>
                <p className="text-xs text-muted-foreground">Среднее время</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Favorites */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Недавние избранные
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cabinet?tab=favorites">Все →</Link>
            </Button>
          </div>

          {stats.recentFavorites.length > 0 ? (
            <div className="space-y-3">
              {stats.recentFavorites.map((fav: any) => (
                <div
                  key={fav.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{fav.offerId}</p>
                    <p className="text-xs text-muted-foreground">
                      {fav.note || 'Без заметки'}
                    </p>
                  </div>
                  <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                Нет избранных офферов
              </p>
              <Button size="sm" asChild>
                <Link href="/zaimy">
                  <Plus className="h-3 w-3 mr-2" />
                  Найти займ
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent History */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Недавние поиски
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cabinet?tab=history">Все →</Link>
            </Button>
          </div>

          {stats.recentHistory.length > 0 ? (
            <div className="space-y-3">
              {stats.recentHistory.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {item.query || 'Поиск без запроса'}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {item.amount && (
                        <Badge variant="outline" className="text-xs">
                          {item.amount} ₽
                        </Badge>
                      )}
                      {item.term && (
                        <Badge variant="outline" className="text-xs">
                          {item.term} дн.
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.resultsCount || 0} рез.
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                История поиска пуста
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
