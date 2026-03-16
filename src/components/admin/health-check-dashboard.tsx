'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Clock,
  Globe
} from 'lucide-react';
import { HealthCheckChat } from './health-check-chat';
import { HealthPagesList } from './health-pages-list';
import { HealthIncidentsList } from './health-incidents-list';

interface HealthStats {
  total: number;
  healthy: number;
  warning: number;
  error: number;
  critical: number;
  unknown: number;
}

interface HealthStatus {
  systemStatus: 'operational' | 'degraded' | 'partial_outage' | 'major_outage';
  stats: HealthStats;
  uptime: number;
  avgResponseTime: number;
  activeIncidents: number;
  sslExpiringSoon: number;
}

export function HealthCheckDashboard() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/health/status');
      const data = await res.json();
      
      if (data.success) {
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Автообновление каждые 30 секунд
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStatus();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statusConfig = {
    operational: { label: 'Все системы работают', color: 'bg-green-500', icon: CheckCircle2 },
    degraded: { label: 'Частичные проблемы', color: 'bg-yellow-500', icon: AlertTriangle },
    partial_outage: { label: 'Частичный сбой', color: 'bg-orange-500', icon: AlertCircle },
    major_outage: { label: 'Критический сбой', color: 'bg-red-500', icon: XCircle }
  };

  const currentStatus = statusConfig[status?.systemStatus || 'operational'];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Статус системы</CardTitle>
            <StatusIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${currentStatus.color}`} />
              <span className="text-2xl font-bold">{currentStatus.label}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.uptime || 0}%</div>
            <p className="text-xs text-muted-foreground">За последние 24 часа</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Среднее время ответа</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.avgResponseTime || 0} мс</div>
            <p className="text-xs text-muted-foreground">По всем страницам</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные инциденты</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.activeIncidents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {status?.sslExpiringSoon ? `${status.sslExpiringSoon} SSL истекает` : 'SSL в порядке'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Распределение статусов</CardTitle>
              <CardDescription>
                {status?.stats.total || 0} страниц в мониторинге
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="font-medium">Healthy: {status?.stats.healthy || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Warning: {status?.stats.warning || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span className="font-medium">Error: {status?.stats.error || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="font-medium">Critical: {status?.stats.critical || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages">
            <Globe className="h-4 w-4 mr-2" />
            Страницы
          </TabsTrigger>
          <TabsTrigger value="incidents">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Инциденты
            {status?.activeIncidents ? (
              <Badge variant="destructive" className="ml-2">
                {status.activeIncidents}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="chat">
            <Activity className="h-4 w-4 mr-2" />
            AI-агент
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <HealthPagesList />
        </TabsContent>

        <TabsContent value="incidents">
          <HealthIncidentsList />
        </TabsContent>

        <TabsContent value="chat">
          <HealthCheckChat />
        </TabsContent>
      </Tabs>
    </div>
  );
}
