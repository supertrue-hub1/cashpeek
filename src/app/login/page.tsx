/**
 * Страница входа
 */

import { Suspense } from 'react';
import { LoginFormWrapper } from '@/components/auth/login-form-wrapper';

export const metadata = {
  title: 'Вход | Cashpeek',
  description: 'Войдите в личный кабинет для управления избранным и просмотра истории',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-lg border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Вход в аккаунт
            </h1>
            <p className="text-muted-foreground">
              Войдите для доступа к избранному
            </p>
          </div>

          <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded" />}>
            <LoginFormWrapper />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

