/**
 * Страница регистрации
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { RegisterFormWrapper } from '@/components/auth/register-form-wrapper';

export const metadata = {
  title: 'Регистрация | Cashpeek',
  description: 'Создайте аккаунт для сохранения избранного и получения персональных предложений',
};

export default async function RegisterPage() {
  const session = await auth();

  // Если уже авторизован - редирект в кабинет
  if (session) {
    redirect('/cabinet');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-lg border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Создание аккаунта
            </h1>
            <p className="text-muted-foreground">
              Зарегистрируйтесь для доступа к избранному
            </p>
          </div>

          <Suspense fallback={<div className="animate-pulse h-80 bg-muted rounded" />}>
            <RegisterFormWrapper />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

