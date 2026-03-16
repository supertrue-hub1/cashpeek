/**
 * Настройки профиля
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header, Footer } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Редирект если не авторизован
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/cabinet/settings');
    }
  }, [status, router]);

  // Загрузка
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  // Не авторизован
  if (status === 'unauthenticated' || !session) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const user = session.user;

  // Обработка выхода
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/cabinet">← Назад в кабинет</Link>
            </Button>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Настройки профиля</h1>

            {/* Основная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Основная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    defaultValue={user.name || ''}
                    placeholder="Ваше имя"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email нельзя изменить
                  </p>
                </div>
                <Button>Сохранить изменения</Button>
              </CardContent>
            </Card>

            {/* Безопасность */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Безопасность
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Текущий пароль</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Новый пароль</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button>Изменить пароль</Button>
              </CardContent>
            </Card>

            {/* Опасная зона */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Опасная зона</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  После удаления аккаунт восстановить будет невозможно
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleLogout}>
                    Выйти из аккаунта
                  </Button>
                  <Button variant="destructive">
                    Удалить аккаунт
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
