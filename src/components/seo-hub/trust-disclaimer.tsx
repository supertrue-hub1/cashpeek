import { Shield, AlertTriangle, FileText, Scale, Clock, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function TrustDisclaimer() {
  return (
    <section className="py-8 lg:py-12 bg-muted/30 border-t border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Trust Badges */}
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Лицензия ЦБ РФ</p>
                <p className="text-xs text-muted-foreground">Все МФО проверены</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Scale className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Защита данных</p>
                <p className="text-xs text-muted-foreground">SSL шифрование</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Прозрачные условия</p>
                <p className="text-xs text-muted-foreground">Без скрытых комиссий</p>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Disclaimer */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Информация о рисках
                </h3>
                <p className="text-sm text-muted-foreground">
                  Микрозайм — это финансовая услуга с высокой процентной ставкой. 
                  Максимальная годовая процентная ставка (ПСК) может достигать 292% годовых (0.8% в день). 
                  Перед оформлением займа внимательно ознакомьтесь с условиями договора.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Сроки и суммы
                </h3>
                <p className="text-sm text-muted-foreground">
                  Минимальная сумма займа: от 1 000 ₽. Максимальная сумма: до 100 000 ₽. 
                  Срок займа: от 1 до 365 дней. Первый займ под 0% доступен новым клиентам 
                  при условии своевременного погашения.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Контакты
                </h3>
                <p className="text-sm text-muted-foreground">
                  По вопросам работы сервиса обращайтесь:{' '}
                  <a 
                    href="mailto:support@cashpeek.ru"
                    className="text-primary hover:underline"
                  >
                    support@cashpeek.ru
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Legal */}
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              Сервис CashPeek является информационным агрегатором и не выдаёт займы. 
              Все предложения на сайте представлены от партнёров — микрофинансовых организаций, 
              включённых в реестр ЦБ РФ.
            </p>
            <p>
              © {new Date().getFullYear()} CashPeek. Все права защищены. 
              Используя сайт, вы соглашаетесь с{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Политикой конфиденциальности
              </a>{' '}
              и{' '}
              <a href="/terms" className="text-primary hover:underline">
                Пользовательским соглашением
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
