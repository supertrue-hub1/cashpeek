'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Search,
  Plus,
  MoreVertical,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HealthPage {
  id: string;
  url: string;
  name: string;
  category: string;
  lastStatus: string;
  lastResponseTime: number | null;
  lastCheckAt: string | null;
  priority: number;
  checkInterval: number;
  uptime24h: number;
  sslDaysLeft: number | null;
  isActive: boolean;
  _count?: {
    incidents: number;
  };
}

export function HealthPagesList() {
  const [pages, setPages] = useState<HealthPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchPages = async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/health/pages?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setPages(data.pages);
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [categoryFilter, statusFilter]);

  const handleCheck = async (pageId: string) => {
    setChecking(pageId);
    try {
      const res = await fetch('/api/health/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId })
      });

      if (res.ok) {
        // Обновляем список
        await fetchPages();
      }
    } catch (error) {
      console.error('Failed to check page:', error);
    } finally {
      setChecking(null);
    }
  };

  const handleCheckAll = async () => {
    setChecking('all');
    try {
      // Проверяем все страницы параллельно (максимум 5 за раз)
      const chunks = [];
      for (let i = 0; i < pages.length; i += 5) {
        chunks.push(pages.slice(i, i + 5));
      }

      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(page =>
            fetch('/api/health/check', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pageId: page.id })
            })
          )
        );
      }

      await fetchPages();
    } catch (error) {
      console.error('Failed to check all pages:', error);
    } finally {
      setChecking(null);
    }
  };

  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(search.toLowerCase()) ||
    page.url.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      healthy: 'default',
      warning: 'secondary',
      error: 'outline',
      critical: 'destructive',
      unknown: 'outline'
    };

    const labels: Record<string, string> = {
      healthy: 'Работает',
      warning: 'Медленно',
      error: 'Ошибка',
      critical: 'Критично',
      unknown: 'Не проверено'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      main: 'Главная',
      mfo: 'МФО',
      api: 'API',
      static: 'Статика'
    };
    return labels[category] || category;
  };

  const formatTime = (date: string | null) => {
    if (!date) return '—';
    
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин`;
    if (diffHours < 24) return `${diffHours} ч`;
    return `${diffDays} дн`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Страницы в мониторинге ({pages.length})</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckAll}
              disabled={checking === 'all'}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${checking === 'all' ? 'animate-spin' : ''}`} />
              Проверить все
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Добавить
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию или URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              <SelectItem value="main">Главная</SelectItem>
              <SelectItem value="mfo">МФО</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="static">Статика</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="healthy">Работает</SelectItem>
              <SelectItem value="warning">Медленно</SelectItem>
              <SelectItem value="error">Ошибка</SelectItem>
              <SelectItem value="critical">Критично</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Статус</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Время ответа</TableHead>
              <TableHead>Uptime 24ч</TableHead>
              <TableHead>SSL</TableHead>
              <TableHead>Проверка</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPages.map((page) => (
              <TableRow key={page.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(page.lastStatus)}
                    {getStatusBadge(page.lastStatus)}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{page.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {page.url}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getCategoryLabel(page.category)}</Badge>
                </TableCell>
                <TableCell>
                  {page.lastResponseTime ? (
                    <span className={page.lastResponseTime > 1000 ? 'text-yellow-600' : ''}>
                      {page.lastResponseTime} мс
                    </span>
                  ) : '—'}
                </TableCell>
                <TableCell>
                  <span className={page.uptime24h < 95 ? 'text-yellow-600' : ''}>
                    {page.uptime24h.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>
                  {page.sslDaysLeft !== null ? (
                    <span className={page.sslDaysLeft < 30 ? 'text-red-600' : ''}>
                      {page.sslDaysLeft} дн
                    </span>
                  ) : '—'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(page.lastCheckAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCheck(page.id)}
                      disabled={checking === page.id}
                    >
                      <RefreshCw className={`h-4 w-4 ${checking === page.id ? 'animate-spin' : ''}`} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Редактировать</DropdownMenuItem>
                        <DropdownMenuItem>История проверок</DropdownMenuItem>
                        <DropdownMenuItem>Отключить</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredPages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Нет страниц для отображения
          </div>
        )}
      </CardContent>
    </Card>
  );
}
