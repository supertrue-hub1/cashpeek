import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { generateCanonicalMetadata } from '@/lib/seo/canonical';
import { FileText, Shield, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Оферта — CashPeek.ru',
  description: 'Публичная оферта на использование информационного сервиса CashPeek.ru.',
  ...generateCanonicalMetadata('/docs/offerta'),
};

export default function OffertaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-b from-slate-50 to-white border-b">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Публичная оферта
            </h1>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Внимание:</strong> CashPeek.ru не является финансовой организацией, 
                кредитором или МФО. Мы предоставляем только информационные услуги.
              </div>
            </div>
            
            <div className="prose prose-slate max-w-none">
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">1. Термины и определения</h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-1">
                <li><strong>Исполнитель</strong> — владелец и администратор сайта cashpeek.ru</li>
                <li><strong>Пользователь</strong> — физическое лицо, использующее Сайт</li>
                <li><strong>МФО</strong> — микрофинансовая организация, партнер Исполнителя</li>
                <li><strong>Услуга</strong> — информационные услуги по подбору и сравнению займов</li>
              </ul>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">2. Предмет оферты</h2>
              <p className="text-slate-600 mb-4">
                Исполнитель обязуется предоставить Пользователю доступ к информации о финансовых 
                продуктах (займах) от МФО, а Пользователь обязуется использовать эту информацию 
                в соответствии с условиями настоящей оферты.
              </p>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">3. Права и обязанности сторон</h2>
              <p className="text-slate-600 mb-2"><strong>Исполнитель обязуется:</strong></p>
              <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
                <li>Предоставлять актуальную информацию об услугах МФО</li>
                <li>Обеспечивать бесперебойную работу Сайта</li>
                <li>Защищать персональные данные Пользователя</li>
              </ul>
              
              <p className="text-slate-600 mb-2"><strong>Пользователь обязуется:</strong></p>
              <ul className="list-disc pl-6 text-slate-600 space-y-1 mb-4">
                <li>Не использовать Сайт для противоправных целей</li>
                <li>Не передавать третьим лицам доступ к Сайту</li>
                <li>Не копировать материалы Сайта без разрешения</li>
              </ul>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">4. Ответственность</h2>
              <p className="text-slate-600 mb-4">
                Исполнитель не несет ответственности за качество, безопасность и законность 
                услуг, предоставляемых МФО. Все отношения между Пользователем и МФО регулируются 
                договором, заключаемым непосредственно между ними.
              </p>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">5. Возврат средств</h2>
              <p className="text-slate-600 mb-4">
                Поскольку Исполнитель предоставляет информационные услуги, возврат денежных 
                средств за использование Сайта не предусмотрен.
              </p>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">6. Разрешение споров</h2>
              <p className="text-slate-600 mb-4">
                Споры, возникающие из настоящей оферты, разрешаются путем переговоров. 
                При невозможности достижения согласия — в судебном порядке по законодательству РФ.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
