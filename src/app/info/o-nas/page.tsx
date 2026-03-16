import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { generateCanonicalMetadata } from '@/lib/seo/canonical';

export const metadata: Metadata = {
  title: 'О нас — CashPeek.ru',
  description: 'CashPeek.ru — независимый финансовый сервис сравнения займов и кредитов от МФО России. Помогаем найти лучшие условия кредитования.',
  ...generateCanonicalMetadata('/info/o-nas'),
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-b from-slate-50 to-white border-b">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              О проекте CashPeek.ru
            </h1>
            
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-600 mb-6">
                CashPeek.ru — независимый финансовый сервис, который помогает пользователям 
                найти лучшие условия займов от микрофинансовых организаций России.
              </p>
              
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                Наша миссия
              </h2>
              <p className="text-slate-600 mb-4">
                Мы стремимся сделать финансовые услуги прозрачными и доступными. 
                Наша команда ежедневно мониторит рынок МФО, обновляет информацию об 
                условиях займов и помогает пользователям принять взвешенное решение.
              </p>
              
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                Что мы предлагаем
              </h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Актуальные данные о займах от проверенных МФО</li>
                <li>Удобный поиск по категориям, городам и суммам</li>
                <li>Честные отзывы и рейтинги</li>
                <li>Бесплатное сравнение предложений</li>
                <li>Безопасные ссылки на официальные сайты МФО</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                Почему нам доверяют
              </h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Только проверенные и лицензированные МФО</li>
                <li>Регулярное обновление информации</li>
                <li>Полная прозрачность условий</li>
                <li>Без скрытых комиссий и платежей</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
