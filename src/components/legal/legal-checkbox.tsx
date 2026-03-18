'use client';

import * as React from 'react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface LegalCheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  variant?: 'full' | 'short';
}

export function LegalCheckbox({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  variant = 'full',
}: LegalCheckboxProps) {
  return (
    <div className={cn('flex items-start gap-2', className)}>
      <Checkbox
        id="legal-agreement"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="mt-0.5"
      />
      <label
        htmlFor="legal-agreement"
        className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none"
      >
        {variant === 'full' ? (
          <>
            Я принимаю{' '}
            <Link 
              href="/terms" 
              className="text-primary underline-offset-4 hover:underline"
              target="_blank"
            >
              Пользовательское соглашение
            </Link>{' '}
            и даю согласие на{' '}
            <Link 
              href="/privacy" 
              className="text-primary underline-offset-4 hover:underline"
              target="_blank"
            >
              обработку персональных данных
            </Link>
          </>
        ) : (
          <>
            Согласен с{' '}
            <Link 
              href="/terms" 
              className="text-primary underline-offset-4 hover:underline"
              target="_blank"
            >
              условиями использования
            </Link>
          </>
        )}
      </label>
    </div>
  );
}

// Компактная версия для модальных окон
export function LegalCheckboxCompact({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
}: Omit<LegalCheckboxProps, 'variant'>) {
  return (
    <LegalCheckbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={className}
      variant="short"
    />
  );
}
