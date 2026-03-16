'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  AlertCircle,
  XCircle,
  Info,
  RefreshCw,
  CheckCircle2,
  Eye,
  X
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface HealthIncident {
  id: string;
  incidentNumber: string;
  severity: string;
  title: string;
  description: string | null;
  errorType: string | null;
  errorMessage: string | null;
  startedAt: string;
  resolvedAt: string | null;
  duration: number | null;
  status: string;
  resolution: string | null;
  page: {
    id: string;
    name: string;
    url: string;
  };
}

export function HealthIncidentsList() {
  const [incidents, setIncidents] = useState<HealthIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<HealthIncident | null>(null);
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchIncidents = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/health/incidents?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setIncidents(data.incidents);
      }
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter]);

  const handleResolve = async () => {
    if (!selectedIncident) return;
    
    setResolving(true);
    try {
      const res = await fetch('/api/health/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedIncident.id,
          status: 'resolved',
          resolution
        })
      });

      if (res.ok) {
        setSelectedIncident(null);
        setResolution('');
        await fetchIncidents();
      }
    } catch (error) {
      console.error('Failed to resolve incident:', error);
    } finally {
      setResolving(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      critical: 'destructive',
      high: 'outline',
      medium: 'secondary',
      low: 'default'
    };

    return (
      <Badge variant={variants[severity] || 'outline'}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      open: 'destructive',
      investigating: 'outline',
      identified: 'secondary',
      monitoring: 'default',
      resolved: 'default'
    };

    const labels: Record<string, string> = {
      open: 'Открыт',
      investigating: 'Расследуется',
      identified: 'Идентифицирован',
      monitoring: 'Мониторинг',
      resolved: 'Решён'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '—';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Инциденты ({incidents.length})</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Фильтр по статусу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="open">Открытые</SelectItem>
                <SelectItem value="investigating">Расследуются</SelectItem>
                <SelectItem value="resolved">Решённые</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Страница</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Начало</TableHead>
                <TableHead>Длительность</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-mono text-sm">
                    {incident.incidentNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(incident.severity)}
                      {getSeverityBadge(incident.severity)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{incident.page.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {incident.page.url}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px]">
                      <div className="font-medium">{incident.title}</div>
                      {incident.errorMessage && (
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {incident.errorMessage}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(incident.status)}</TableCell>
                  <TableCell className="text-sm">
                    {formatTime(incident.startedAt)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {incident.status === 'resolved'
                      ? formatDuration(incident.duration)
                      : incident.resolvedAt
                      ? formatDuration(incident.duration)
                      : '—'
                    }
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedIncident(incident)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {incidents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>Нет инцидентов</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for incident details */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIncident && getSeverityIcon(selectedIncident.severity)}
              {selectedIncident?.incidentNumber} — {selectedIncident?.page.name}
            </DialogTitle>
            <DialogDescription>
              {selectedIncident?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Статус</div>
                <div className="mt-1">
                  {selectedIncident && getStatusBadge(selectedIncident.status)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Severity</div>
                <div className="mt-1">
                  {selectedIncident && getSeverityBadge(selectedIncident.severity)}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground">Страница</div>
              <div className="mt-1">
                <div className="font-medium">{selectedIncident?.page.name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedIncident?.page.url}
                </div>
              </div>
            </div>

            {selectedIncident?.errorMessage && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Ошибка</div>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm font-mono">
                  {selectedIncident.errorMessage}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Начало</div>
                <div className="mt-1">
                  {selectedIncident && formatTime(selectedIncident.startedAt)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Длительность</div>
                <div className="mt-1">
                  {selectedIncident && formatDuration(selectedIncident.duration)}
                </div>
              </div>
            </div>

            {selectedIncident?.resolution && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Решение</div>
                <div className="mt-1 p-3 bg-green-50 dark:bg-green-950 rounded-md text-sm">
                  {selectedIncident.resolution}
                </div>
              </div>
            )}

            {selectedIncident?.status !== 'resolved' && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Решение
                </div>
                <Textarea
                  placeholder="Опишите решение..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedIncident(null)}
            >
              Закрыть
            </Button>
            {selectedIncident?.status !== 'resolved' && (
              <Button
                onClick={handleResolve}
                disabled={resolving || !resolution}
              >
                {resolving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Закрытие...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Закрыть инцидент
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
