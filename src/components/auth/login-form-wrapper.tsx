'use client';

import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';

export function LoginFormWrapper() {
  const router = useRouter();
  
  return (
    <LoginForm 
      onSuccess={() => {
        // NextAuth сам делает редирект, это резервный вариант
        router.push('/cabinet');
      }}
      onSwitchToRegister={() => {
        const url = new URL(window.location.href);
        const callbackUrl = url.searchParams.get('callbackUrl');
        const registerUrl = callbackUrl 
          ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
          : '/register';
        router.push(registerUrl);
      }}
    />
  );
}
