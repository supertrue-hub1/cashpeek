'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Loader2 } from 'lucide-react';
import {
  CabinetSidebar,
  OverviewContent,
  FavoritesContent,
  HistoryContent,
  SettingsContent,
  SecurityContent,
  NotificationsContent,
  SmartDebtContent,
  type TabValue,
} from '@/components/cabinet';

interface CabinetPageContentProps {
  initialTab: string;
}

const VALID_TABS: TabValue[] = ['overview', 'favorites', 'history', 'settings', 'security', 'notifications', 'smart-debt'];

export function CabinetPageContent({ initialTab }: CabinetPageContentProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Редирект если не авторизован
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/cabinet');
    }
  }, [status, router]);

  // Загрузка
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Не авторизован
  if (status === 'unauthenticated' || !session) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const user = session.user;
  const isAdmin = user.role === 'admin';

  // Валидация вкладки
  const activeTab: TabValue = VALID_TABS.includes(initialTab as TabValue) 
    ? (initialTab as TabValue) 
    : 'overview';

  // Рендер контента в зависимости от вкладки
  const renderContent = () => {
    switch (activeTab) {
      case 'favorites':
        return <FavoritesContent />;
      case 'history':
        return <HistoryContent />;
      case 'settings':
        return <SettingsContent />;
      case 'security':
        return <SecurityContent />;
      case 'notifications':
        return <NotificationsContent />;
      case 'smart-debt':
        return <SmartDebtContent />;
      case 'overview':
      default:
        return <OverviewContent />;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Profile Header */}
      <Card className="mb-6 border-border overflow-hidden">
        <div className="h-16 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center -mt-8">
            <Avatar className="h-14 w-14 border-4 border-background shadow-lg">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="text-base bg-primary text-primary-foreground">
                {user.name?.[0] || user.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-semibold text-foreground">
                  {user.name || 'Пользователь'}
                </h1>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  {isAdmin ? 'Администратор' : 'Активен'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Layout: Sidebar + Content */}
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="order-2 lg:order-1">
          <Card className="border-border sticky top-4">
            <CardContent className="p-3">
              <CabinetSidebar activeTab={activeTab} isAdmin={isAdmin} />
            </CardContent>
          </Card>
        </aside>

        {/* Content */}
        <main className="order-1 lg:order-2 min-h-[400px]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
