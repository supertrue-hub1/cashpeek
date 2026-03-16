/**
 * Кнопка выхода
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    startTransition(async () => {
      await logout();
      router.push('/');
      router.refresh();
    });
  };

  return (
    <Button
      variant="outline"
      className="w-full gap-2 border-border text-muted-foreground hover:text-destructive"
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      Выйти
    </Button>
  );
}
