'use client';

import * as React from 'react';
import { Shield, AlertCircle, Info, Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBlockProps {
  className?: string;
}

export function TrustBlock({ className }: TrustBlockProps) {
  return (
    <section className={cn('py-8 bg-background border-b border-border/50', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Trust indicators */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium text-foreground text-sm">Проверенные МФО</div>
              <div className="text-xs text-muted-foreground">Только лицензированные</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/30">
              <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="font-medium text-foreground text-sm">Безопасно</div>
              <div className="text-xs text-muted-foreground">Шифрование данных</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-medium text-foreground text-sm">Обновляется</div>
              <div className="text-xs text-muted-foreground">Ежедневно</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/30">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="font-medium text-foreground text-sm">Бесплатно</div>
              <div className="text-xs text-muted-foreground">Для заёмщиков</div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 bg-muted rounded-lg border border-border/50">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Информация о займах:</strong> Все условия (ставки, суммы, сроки) указаны в ознакомительных целях. 
            Окончательные условия определяются МФО при одобрении заявки. Микрозаймы выдаются под высокую процентную ставку. 
            Внимательно читайте договор перед подписанием. Микрофинансовые организации осуществляют деятельность на основании 
            лицензии ЦБ РФ. Не является публичной офертой.
          </div>
        </div>
      </div>
    </section>
  );
}
