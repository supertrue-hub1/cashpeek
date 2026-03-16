'use client';

import * as React from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { syncGuestData, type GuestData } from '@/app/actions/auth';
import { toast } from 'sonner';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'register';
  callbackUrl?: string;
}

// Хук для получения данных гостя из localStorage
function useGuestPortfolio() {
  const [guestData, setGuestData] = React.useState<GuestData | null>(null);

  React.useEffect(() => {
    try {
      const guestId = localStorage.getItem('guest_id');
      const favoritesRaw = localStorage.getItem('guest_favorites');
      const historyRaw = localStorage.getItem('guest_search_history');

      if (guestId) {
        setGuestData({
          guestId,
          favorites: favoritesRaw ? JSON.parse(favoritesRaw) : [],
          searchHistory: historyRaw ? JSON.parse(historyRaw) : [],
        });
      }
    } catch (error) {
      console.error('Error reading guest data:', error);
    }
  }, []);

  return guestData;
}

export function AuthModal({ open, onOpenChange, defaultTab = 'login', callbackUrl }: AuthModalProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const guestData = useGuestPortfolio();
  const router = useRouter();

  // Обработка успешного входа
  const handleAuthSuccess = async () => {
    setIsProcessing(true);

    try {
      // Синхронизируем данные гостя
      if (guestData && guestData.favorites.length > 0) {
        const result = await syncGuestData(guestData);
        
        if (result.success && result.data) {
          const { favoritesMigrated, historyMigrated } = result.data;
          
          if (favoritesMigrated > 0 || historyMigrated > 0) {
            toast.success('Портфель синхронизирован', {
              description: `Перенесено: ${favoritesMigrated} избранного, ${historyMigrated} истории`,
            });
          }

          // Очищаем localStorage
          localStorage.removeItem('guest_id');
          localStorage.removeItem('guest_favorites');
          localStorage.removeItem('guest_search_history');
        }
      }

      toast.success('Добро пожаловать!', {
        description: 'Вы успешно вошли в систему',
      });

      onOpenChange(false);
      
      // Редирект если нужно, иначе обновляем страницу
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Auth sync error:', error);
      toast.error('Ошибка синхронизации', {
        description: 'Данные не были перенесены',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Авторизация</DialogTitle>
          <DialogDescription>
            Войдите или зарегистрируйтесь для доступа к личному кабинету
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none h-12 bg-muted/50">
            <TabsTrigger 
              value="login" 
              className="rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Вход
            </TabsTrigger>
            <TabsTrigger 
              value="register"
              className="rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Регистрация
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="login" className="mt-0 focus-visible:outline-none">
              <LoginForm 
                onSuccess={handleAuthSuccess} 
                onSwitchToRegister={() => setActiveTab('register')}
                isProcessing={isProcessing}
              />
            </TabsContent>

            <TabsContent value="register" className="mt-0 focus-visible:outline-none">
              <RegisterForm 
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setActiveTab('login')}
                isProcessing={isProcessing}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
