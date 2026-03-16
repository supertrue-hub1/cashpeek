import * as React from 'react';
import { CreditCard, Mail, Shield, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

const footerLinks = {
  main: [
    { href: '#offers', label: 'Займы онлайн' },
    { href: '/sravnit', label: 'Сравнить займы' },
    { href: '#faq', label: 'Вопросы и ответы' },
  ],
  info: [
    { href: '/blog', label: 'Блог' },
    { href: '#', label: 'Контакты' },
    { href: '#', label: 'О проекте' },
  ],
  legal: [
    { href: '#', label: 'Политика конфиденциальности' },
    { href: '#', label: 'Пользовательское соглашение' },
    { href: '#', label: 'Отказ от ответственности' },
    { href: '/complaint/cbrf', label: 'Жалоба в ЦБ РФ' },
  ],
};

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('border-t border-border bg-muted/30', className)}>
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <CreditCard className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">
                cash<span className="text-primary">peek</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground mb-4">
              Сервис сравнения микрофинансовых организаций. 
              Помогаем выбрать лучший займ.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-muted-foreground/60" />
              <a href={`mailto:${process.env.NEXT_PUBLIC_SITE_EMAIL || 'support@cashpeek.ru'}`} className="hover:text-primary transition-colors">
                {process.env.NEXT_PUBLIC_SITE_EMAIL || 'support@cashpeek.ru'}
              </a>
            </div>
          </div>

          {/* Main links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Займы</h3>
            <ul className="space-y-2">
              {footerLinks.main.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Информация</h3>
            <ul className="space-y-2">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Документы</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-border" />

        {/* Disclaimer */}
        <div className="mb-6">
          <div className="flex items-start gap-3 rounded-2xl bg-card p-4 border border-border">
            <Shield className="h-5 w-5 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Сайт не является кредитной организацией и не выдаёт займы. 
              Информация носит справочный характер. Условия займов определяются 
              кредитными организациями. Перед оформлением ознакомьтесь с договором. 
              Микрозаймы доступны гражданам РФ старше 18 лет. Неуплата задолженности 
              может негативно повлиять на кредитную историю.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground/60">
            © {new Date().getFullYear()} cashpeek. Все права защищены.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
            <FileText className="h-3 w-3" />
            <span>Информация обновляется ежедневно</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
