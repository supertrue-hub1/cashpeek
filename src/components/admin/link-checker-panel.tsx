'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  RefreshCw, AlertTriangle, CheckCircle, XCircle, Eye, 
  Search, Filter, Loader2, ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';

interface BrokenLinkOffer {
  id: string;
  name: string;
  slug: string;
  affiliateUrl: string | null;
  syncSource: string | null;
  isBroken: boolean;
  lastChecked: string | null;
  httpStatus: number | null;
  brokenSince: string | null;
  brokenReason: string | null;
  ignoreBroken: boolean;
  status: string;
}

interface Stats {
  syncSource: string | null;
  isBroken: boolean;
  _count: number;
}

export function LinkCheckerPanel() {
  const [offers, setOffers] = useState<BrokenLinkOffer[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [filter, setFilter] = useState<'all' | 'broken' | 'fixed'>('broken');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ limit: 50, offset: 0, hasMore: false });
  const [total, setTotal] = useState(0);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: filter,
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });
      
      const res = await fetch(`/api/admin/link-checker?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setOffers(data.offers);
        setStats(data.stats);
        setTotal(data.total);
        setPagination(prev => ({ ...prev, hasMore: data.pagination.hasMore }));
      }
    } catch (error) {
      console.error('Failed to fetch links:', error);
      toast.error('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [filter, pagination.limit, pagination.offset]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleCheckAll = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/admin/link-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkAll: true }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Проверено: ${data.checked}, Битых: ${data.broken}, Исправлено: ${data.fixed}`);
        fetchLinks();
      } else {
        toast.error(data.error || 'Ошибка');
      }
    } catch (error) {
      toast.error('Ошибка проверки');
    } finally {
      setChecking(false);
    }
  };

  const handleRecheck = async (offerId: string) => {
    setChecking(true);
    try {
      const res = await fetch('/api/admin/link-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerIds: [offerId] }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.fixed > 0 ? 'Ссылка исправлена!' : 'Ссылка всё ещё битая');
        fetchLinks();
      }
    } catch (error) {
      toast.error('Ошибка проверки');
    } finally {
      setChecking(false);
    }
  };

  const handleToggleIgnore = async (offerId: string, ignore: boolean) => {
    try {
      const res = await fetch('/api/admin/link-checker', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, ignoreBroken: ignore }),
      });
      
      if (res.ok) {
        toast.success(ignore ? 'Игнорирование включено' : 'Игнорирование снято');
        fetchLinks();
      }
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const handleArchive = async (offerId: string) => {
    try {
      const res = await fetch('/api/admin/link-checker', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, status: 'archived' }),
      });
      
      if (res.ok) {
        toast.success('Оффер архивирован');
        fetchLinks();
      }
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  // Вычисляем статистику
  const brokenBySource = stats
    .filter(s => s.isBroken)
    .reduce((acc, s) => {
      acc[s.syncSource || 'direct'] = (acc[s.syncSource || 'direct'] || 0) + s._count;
      return acc;
    }, {} as Record<string, number>);

  const filteredOffers = offers.filter(o => 
    !search || o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Всего ссылок</CardDescription>
            <CardTitle className="text-2xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader className="pb-2">
            <CardDescription>Битые</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {stats.filter(s => s.isBroken).reduce((sum, s) => sum + s._count, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <CardDescription>Рабочие</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {stats.filter(s => !s.isBroken).reduce((sum, s) => sum + s._count, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Источники</CardDescription>
            <CardTitle className="text-2xl">{Object.keys(brokenBySource).length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Панель управления */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Broken Link Guardian</CardTitle>
              <CardDescription>
                Проверка ссылок офферов на доступность
              </CardDescription>
            </div>
            <Button 
              onClick={handleCheckAll} 
              disabled={checking}
              className="gap-2"
            >
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Проверить все
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            {/* Фильтр */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'broken' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('broken')}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Битые
              </Button>
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                <Eye className="h-4 w-4 mr-1" />
                Все
              </Button>
              <Button
                variant={filter === 'fixed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('fixed')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Исправленные
              </Button>
            </div>
            
            {/* Поиск */}
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Таблица */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Оффер</TableHead>
                  <TableHead>Источник</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>HTTP</TableHead>
                  <TableHead>Причина</TableHead>
                  <TableHead>Проверено</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredOffers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {filter === 'broken' ? 'Нет битых ссылок!' : 'Нет данных'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOffers.map((offer) => (
                    <TableRow key={offer.id} className={offer.isBroken ? 'bg-red-50/50 dark:bg-red-950/10' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {offer.isBroken ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {offer.name}
                        </div>
                        {offer.affiliateUrl && (
                          <a 
                            href={offer.affiliateUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:underline flex items-center gap-1 mt-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {offer.affiliateUrl.slice(0, 50)}...
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{offer.syncSource || 'direct'}</Badge>
                      </TableCell>
                      <TableCell>
                        {offer.isBroken ? (
                          <Badge variant="destructive">Битая</Badge>
                        ) : (
                          <Badge variant="secondary">Рабочая</Badge>
                        )}
                        {offer.ignoreBroken && (
                          <Badge variant="outline" className="ml-1">Игнор</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {offer.httpStatus ? (
                          <span className={offer.httpStatus >= 400 ? 'text-red-600 font-mono' : 'font-mono'}>
                            {offer.httpStatus}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {offer.brokenReason || '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {offer.lastChecked ? (
                          <span className="text-muted-foreground">
                            {new Date(offer.lastChecked).toLocaleString('ru')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Никогда</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRecheck(offer.id)}
                            disabled={checking}
                            title="Перепроверить"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleIgnore(offer.id, !offer.ignoreBroken)}
                            title={offer.ignoreBroken ? 'Снять игнорирование' : 'Игнорировать'}
                          >
                            {offer.ignoreBroken ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <Filter className="h-4 w-4" />
                            )}
                          </Button>
                          {offer.isBroken && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArchive(offer.id)}
                              title="Архивировать"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Пагинация */}
          {pagination.hasMore && (
            <div className="mt-4 flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => setPagination(p => ({ ...p, offset: p.offset + p.limit }))}
              >
                Загрузить ещё
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default LinkCheckerPanel;
