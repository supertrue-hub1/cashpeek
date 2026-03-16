'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface HistoryItem {
  id: string;
  query?: string;
  amount?: number;
  term?: number;
  city?: string;
  resultsCount?: number;
  createdAt: string;
}

export function HistoryContent() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const handleClear = async () => {
    try {
      await fetch('/api/user/history', { method: 'DELETE' });
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
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
          <FileText className="h-5 w-5 text-primary" />
          История поиска
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {history.length} запросов
          </span>
          {history.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-2" />
              Очистить
            </Button>
          )}
        </div>
      </div>

      {history.length > 0 ? (
        <div className="space-y-3">
          {history.map((item) => (
            <Card key={item.id} className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {item.query ? (
                      <p className="font-medium">"{item.query}"</p>
                    ) : (
                      <p className="font-medium text-muted-foreground">Поиск без запроса</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.amount && (
                        <Badge variant="secondary" className="text-xs">
                          {item.amount.toLocaleString('ru-RU')} ₽
                        </Badge>
                      )}
                      {item.term && (
                        <Badge variant="secondary" className="text-xs">
                          {item.term} дней
                        </Badge>
                      )}
                      {item.city && (
                        <Badge variant="outline" className="text-xs">
                          {item.city}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(item.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  {item.resultsCount !== null && item.resultsCount !== undefined && (
                    <div className="text-sm text-muted-foreground text-right">
                      <p className="font-medium">{item.resultsCount}</p>
                      <p className="text-xs">результатов</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border border-dashed">
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">История пуста</h3>
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
  );
}
