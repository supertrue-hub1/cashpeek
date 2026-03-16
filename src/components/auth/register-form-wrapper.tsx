'use client';

import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/auth/register-form';

export function RegisterFormWrapper() {
  const router = useRouter();
  
  return (
    <RegisterForm 
      onSuccess={() => {
        // NextAuth сам делает редирект, это резервный вариант
        router.push('/cabinet');
      }}
      onSwitchToLogin={() => {
        const url = new URL(window.location.href);
        const callbackUrl = url.searchParams.get('callbackUrl');
        const loginUrl = callbackUrl 
          ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
          : '/login';
        router.push(loginUrl);
      }}
    />
  );
}
