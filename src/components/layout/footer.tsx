import * as React from 'react';
import Link from 'next/link';
import { CreditCard, Mail, Shield, FileText, Building2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

// Реквизиты компании
const COMPANY_INFO = {
  name: 'ООО «Кэшпик»',
  ogrnip: '326700000015242',
  inn: '702406362100',
  email: 'support@cashpeek.ru',
  site: 'https://cashpeek.ru',
};

const footerLinks = {
  main: [
    { href: '#offers', label: 'Займы онлайн' },
    { href: '/sravnit', label: 'Сравнить займы' },
    { href: '#faq', label: 'Вопросы и ответы' },
  ],
  info: [
    { href: '/faq', label: 'FAQ' },
    { href: '/blog', label: 'Блог' },
    { href: '/about', label: 'О проекте' },
    { href: 'mailto:support@cashpeek.ru', label: 'Контакты' },
    { href: '/sitemap.xml', label: 'Карта сайта' },
  ],
  legal: [
    { href: '/privacy', label: 'Политика конфиденциальности' },
    { href: '/terms', label: 'Пользовательское соглашение' },
    { href: '/disclaimer', label: 'Отказ от ответственности' },
    { href: '/complaint/cbrf', label: 'Жалоба в ЦБ РФ' },
  ],
};

// Schema.org Organization микроразметка
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": COMPANY_INFO.name,
  "alternateName": "CashPeek",
  "url": COMPANY_INFO.site,
  "email": COMPANY_INFO.email,
  "identifier": {
    "@type": "PropertyValue",
    "name": "ОГРНИП",
    "value": COMPANY_INFO.ogrnip
  },
  "taxID": COMPANY_INFO.inn,
  "contactPoint": {
    "@type": "ContactPoint",
    "email": COMPANY_INFO.email,
    "contactType": "customer service"
  }
};

export function Footer({ className }: FooterProps) {
  return (
    <footer 
      className={cn('border-t border-border bg-muted/30', className)}
      itemScope 
      itemType="https://schema.org/Organization"
    >
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <CreditCard className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">
                cash<span className="text-primary">peek</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Сервис сравнения микрофинансовых организаций. 
              Помогаем выбрать лучший займ.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-muted-foreground/60" />
              <a 
                href="mailto:support@cashpeek.ru" 
                className="hover:text-primary transition-colors"
                itemProp="email"
              >
                support@cashpeek.ru
              </a>
            </div>
          </div>

          {/* Main links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Займы</h3>
            <ul className="space-y-2">
              {footerLinks.main.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
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
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
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
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-border" />

        {/* Disclaimer */}
        <div className="mb-6">
          <div className="flex items-start gap-3 rounded-xl bg-card p-4 border border-border">
            <Shield className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Сайт не является кредитной организацией и не выдаёт займы. 
              Информация носит справочный характер. Условия займов определяются 
              кредитными организациями. Перед оформлением ознакомьтесь с договором. 
              Микрозаймы доступны гражданам РФ старше 18 лет. Неуплата задолженности 
              может негативно повлиять на кредитную историю.
            </p>
          </div>
        </div>

        {/* Legal info block - Реквизиты */}
        <div className="mb-6 rounded-xl bg-muted/50 p-4 border border-border/50">
          <div className="flex items-start gap-2">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 mt-0.5" />
            <div className="text-[11px] text-muted-foreground/70 leading-relaxed">
              <span itemProp="name" className="font-medium">{COMPANY_INFO.name}</span>
              <span className="mx-1.5">•</span>
              <span>ОГРНИП: <span itemProp="identifier">{COMPANY_INFO.ogrnip}</span></span>
              <span className="mx-1.5">•</span>
              <span>ИНН: <span itemProp="taxID">{COMPANY_INFO.inn}</span></span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} {COMPANY_INFO.name}. Все права защищены.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground/50">
            <FileText className="h-3 w-3" />
            <span>Информация обновляется ежедневно</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
