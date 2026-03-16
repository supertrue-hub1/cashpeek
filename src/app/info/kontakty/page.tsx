import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { generateCanonicalMetadata } from '@/lib/seo/canonical';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Контакты — CashPeek.ru',
  description: 'Свяжитесь с нами: email, телефон, адрес. Мы на связи 24/7 для вопросов о займах и МФО.',
  ...generateCanonicalMetadata('/info/kontakty'),
};

export default function ContactsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-b from-slate-50 to-white border-b">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Контакты
            </h1>
            
            <p className="text-lg text-slate-600 mb-8">
              Мы всегда готовы ответить на ваши вопросы и помочь с выбором займа.
            </p>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                    <a href="mailto:info@cashpeek.ru" className="text-primary hover:underline">
                      info@cashpeek.ru
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ответим в течение 24 часов
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Телефон</h3>
                    <a href="tel:+78001234567" className="text-primary hover:underline">
                      8 (800) 123-45-67
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      Бесплатно по России, 24/7
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Адрес</h3>
                    <p className="text-slate-600">
                      г. Москва, ул. Примерная, д. 1
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Офис не предполагает посещения
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Режим работы</h3>
                    <p className="text-slate-600">
                      Сайт: 24/7<br />
                      Поддержка: 09:00 — 21:00 МСК
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Внимание:</strong> Мы не выдаем займы и не являемся МФО. 
                CashPeek.ru — информационный сервис для сравнения предложений.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
