import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { generateCanonicalMetadata } from '@/lib/seo/canonical';
import { Handshake, Users, TrendingUp, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Сотрудничество с МФО — CashPeek.ru',
  description: 'Станьте партнером CashPeek.ru. Привлекайте качественные заявки на займы от проверенных клиентов.',
  ...generateCanonicalMetadata('/info/sotrudnichestvo'),
};

export default function PartnershipPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-b from-slate-50 to-white border-b">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Сотрудничество
            </h1>
            
            <p className="text-lg text-slate-600 mb-8">
              Приглашаем микрофинансовые организации к партнёрству. 
              Мы помогаем МФО привлекать качественные заявки.
            </p>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-white rounded-xl border p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Целевая аудитория</h3>
                <p className="text-sm text-muted-foreground">
                  Миллионы пользователей, ищущих финансовые решения
                </p>
              </div>
              
              <div className="bg-white rounded-xl border p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Конверсия</h3>
                <p className="text-sm text-muted-foreground">
                  Высокий процент одобрения заявок нашими партнерами
                </p>
              </div>
              
              <div className="bg-white rounded-xl border p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Handshake className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Прозрачность</h3>
                <p className="text-sm text-muted-foreground">
                  Честные условия и понятная аналитика
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
              <h2 className="font-semibold text-slate-900 mb-2">Стать партнёром</h2>
              <p className="text-slate-600 mb-4">
                Для обсуждения условий сотрудничества напишите нам на email.
              </p>
              <a 
                href="mailto:partners@cashpeek.ru" 
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                <Mail className="h-4 w-4" />
                partners@cashpeek.ru
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
