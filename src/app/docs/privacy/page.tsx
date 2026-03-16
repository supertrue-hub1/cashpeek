import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { generateCanonicalMetadata } from '@/lib/seo/canonical';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — CashPeek.ru',
  description: 'Политика конфиденциальности и обработки персональных данных на CashPeek.ru.',
  ...generateCanonicalMetadata('/docs/privacy'),
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-b from-slate-50 to-white border-b">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Политика конфиденциальности
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
            </p>
            
            <div className="prose prose-slate max-w-none">
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">1. Общие положения</h2>
              <p className="text-slate-600 mb-4">
                Настоящая политика конфиденциальности (далее — «Политика») определяет порядок 
                обработки и защиты персональных данных пользователей сайта cashpeek.ru (далее — «Сайт»).
              </p>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">2. Какие данные мы собираем</h2>
              <p className="text-slate-600 mb-2">Мы можем собирать следующие данные:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-1">
                <li>IP-адрес и тип браузера</li>
                <li>Cookie-файлы для аналитики</li>
                <li>Данные, добровольно предоставленные пользователем</li>
              </ul>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">3. Как мы используем данные</h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-1">
                <li>Улучшение работы Сайта</li>
                <li>Анализ статистики посещений</li>
                <li>Оптимизация контента и рекламы</li>
              </ul>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">4. Защита данных</h2>
              <p className="text-slate-600 mb-4">
                Мы принимаем необходимые меры для защиты ваших данных от несанкционированного доступа.
              </p>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">5. Cookies</h2>
              <p className="text-slate-600 mb-4">
                Сайт использует cookies для сбора статистики и улучшения пользовательского опыта. 
                Вы можете отключить cookies в настройках браузера.
              </p>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">6. Ссылки на сторонние сайты</h2>
              <p className="text-slate-600 mb-4">
                Сайт может содержать ссылки на сторонние ресурсы. Мы не несем ответственности 
                за политику конфиденциальности этих ресурсов.
              </p>
              
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">7. Контакты</h2>
              <p className="text-slate-600 mb-4">
                По вопросам, связанным с политикой конфиденциальности, обращайтесь: 
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
