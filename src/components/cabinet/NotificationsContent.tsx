'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';

// Mock notifications - в реальном проекте будут загружаться с API
const mockNotifications = [
  {
    id: '1',
    type: 'success',
    title: 'Займ одобрен',
    message: 'Ваша заявка на займ была одобрена',
    time: '2 часа назад',
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'Новый оффер',
    message: 'Появился новый выгодный оффер от МФО "Быстрый займ"',
    time: '5 часов назад',
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Срок истекает',
    message: 'Срок вашего займа истекает через 3 дня',
    time: '1 день назад',
    read: true,
  },
];

export function NotificationsContent() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Уведомления
        </h2>
        <Button variant="outline" size="sm">
          Отметить все прочитанными
        </Button>
      </div>

      {mockNotifications.length > 0 ? (
        <div className="space-y-3">
          {mockNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`border-border cursor-pointer transition-colors hover:border-primary/30 ${
                !notification.read ? 'bg-primary/5' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {notification.time}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border border-dashed">
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Нет уведомлений</h3>
            <p className="text-sm text-muted-foreground">
              Здесь будут отображаться важные уведомления
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
