import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { generateCanonicalMetadata } from '@/lib/seo/canonical';

export const metadata: Metadata = {
  title: 'Пользовательское соглашение — CashPeek.ru',
  description: 'Пользовательское соглашение и условия использования сайта CashPeek.ru.',
  ...generateCanonicalMetadata('/docs/terms'),
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-b from-slate-50 to-white border-b">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Пользовательское соглашение
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
            </p>
            
            <div className="prose prose-slate max-w-none">
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">1. Общие условия</h2>
              <p className="text-slate-600 mb-4">
                Используя сайт cashpeek.ru, вы соглашаетесь с условиями настоящего пользовательского 
                соглашения. Если вы не согласны с каким-либо пунктом, пожалуйста, не используйте Сайт.
              </p>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">2. Предмет соглашения</h2>
              <p className="text-slate-600 mb-4">
                Сайт cashpeek.ru предоставляет информационные услуги по сравнению финансовых 
                продуктов (займов) от сторонних микрофинансовых организаций (МФО). 
                Мы не являемся кредитором и не выдаем займы.
              </p>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">3. Информация об услугах</h2>
              <p className="text-slate-600 mb-4">
                Информация о займах, ставках, условиях и требованиях к заемщикам предоставляется 
                МФО и может изменяться. Мы не гарантируем актуальность данных и рекомендуем 
                проверять условия на официальных сайтах МФО.
              </p>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">4. Ответственность</h2>
              <p className="text-slate-600 mb-4">
                Сайт не несет ответственности за решения, принятые пользователем на основе 
                информации с Сайта. Все финансовые решения принимаются пользователем самостоятельно.
              </p>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">5. Интеллектуальная собственность</h2>
              <p className="text-slate-600 mb-4">
                Все материалы на Сайте защищены авторским правом. Копирование и использование 
                материалов без разрешения запрещено.
              </p>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">6. Ссылки на третьих лиц</h2>
              <p className="text-slate-600 mb-4">
                Сайт может содержать ссылки на сайты третьих лиц. Мы не контролируем эти сайты 
                и не несем ответственности за их содержание.
              </p>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">7. Изменения условий</h2>
              <p className="text-slate-600 mb-4">
                Мы оставляем за собой право изменять настоящее соглашение в любое время. 
                Изменения вступают в силу с момента публикации на Сайте.
              </p>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">8. Контакты</h2>
              <p className="text-slate-600 mb-4">
                По вопросам обращайтесь: 
                <a href="mailto:info@cashpeek.ru" className="text-primary hover:underline ml-1">
                  info@cashpeek.ru
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
