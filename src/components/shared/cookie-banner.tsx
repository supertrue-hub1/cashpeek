'use client';

import * as React from 'react';
import Link from 'next/link';
import { X, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COOKIE_CONSENT_KEY = 'cookie-consent';

interface CookieBannerProps {
  className?: string;
}

export function CookieBanner({ className }: CookieBannerProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    // Проверяем, давал ли пользователь согласие
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Небольшая задержка для плавного появления
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300',
        isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
        className
      )}
    >
      <div className="container max-w-4xl">
        <div className="bg-card border border-border rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Icon */}
            <div className="hidden md:flex shrink-0 h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Cookie className="h-6 w-6 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Использование cookies
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Мы используем файлы cookies для улучшения работы сайта, персонализации контента и анализа посещаемости. 
                    Продолжая использовать сайт, вы соглашаетесь с{' '}
                    <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
                      Политикой конфиденциальности
                    </Link>.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="shrink-0 p-1 rounded-md hover:bg-muted transition-colors md:hidden"
                  aria-label="Закрыть"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecline}
                className="text-sm"
              >
                Отклонить
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                className="text-sm"
              >
                Принять
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компактная версия для мобильных устройств
export function CookieBannerCompact({ className }: CookieBannerProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={cn('fixed bottom-4 left-4 right-4 z-50 md:hidden', className)}>
      <div className="bg-card border border-border rounded-lg shadow-lg p-4">
        <p className="text-xs text-muted-foreground mb-3">
          Мы используем cookies для улучшения работы сайта.{' '}
          <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
            Подробнее
          </Link>
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
              setIsVisible(false);
            }}
            className="flex-1 text-xs"
          >
            Отклонить
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="flex-1 text-xs"
          >
            Принять
          </Button>
        </div>
      </div>
    </div>
  );
}
