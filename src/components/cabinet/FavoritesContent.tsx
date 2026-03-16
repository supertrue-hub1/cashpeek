'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Favorite {
  id: string;
  offerId: string;
  note?: string;
  createdAt: string;
}

export function FavoritesContent() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await fetch(`/api/user/favorites/${id}`, { method: 'DELETE' });
      setFavorites(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Избранные офферы
        </h2>
        <span className="text-sm text-muted-foreground">
          {favorites.length} офферов
        </span>
      </div>

      {favorites.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <Card key={fav.id} className="border-border hover:border-primary/30 transition-colors group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{fav.offerId}</h3>
                    {fav.note && (
                      <p className="text-sm text-muted-foreground mt-1">{fav.note}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Добавлено: {new Date(fav.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemove(fav.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border border-dashed">
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Нет избранных офферов</h3>
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
  );
}
