import { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, LegalDisclaimer, LegalSection, LegalParagraph, LegalList } from '@/components/legal/legal-page';

export const metadata: Metadata = {
  title: 'Отказ от ответственности | CashPeek',
  description: 'Отказ от ответственности сервиса подбора микрозаймов CashPeek. Информация о пределах ответственности агрегатора МФО.',
  robots: 'index, follow',
  openGraph: {
    title: 'Отказ от ответственности | CashPeek',
    description: 'Информация о пределах ответственности сервиса CashPeek',
    type: 'website',
  },
};

const SITE_NAME = 'CashPeek';
const SITE_URL = 'https://cashpeek.ru';
const SUPPORT_EMAIL = 'support@cashpeek.ru';
const LAST_UPDATED = '15 января 2025 г.';

// Schema.org разметка
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Отказ от ответственности",
  "description": "Отказ от ответственности сервиса подбора микрозаймов CashPeek",
  "url": `${SITE_URL}/disclaimer`,
  "isPartOf": {
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL
  },
  "dateModified": "2025-01-15",
  "inLanguage": "ru-RU"
};

export default function DisclaimerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <LegalPage title="Отказ от ответственности" lastUpdated={LAST_UPDATED}>
        {/* Breadcrumbs */}
        <nav className="text-sm text-muted-foreground mb-8 not-prose">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Главная
              </Link>
            </li>
            <li className="text-muted-foreground/50">/</li>
            <li className="text-foreground font-medium">Отказ от ответственности</li>
          </ol>
        </nav>

        {/* Ключевой дисклеймер */}
        <LegalDisclaimer>
          <p className="mb-3">
            <strong>Сайт {SITE_NAME} (далее — «Сайт», «Агрегатор») НЕ ЯВЛЯЕТСЯ КРЕДИТНОЙ ОРГАНИЗАЦИЕЙ, микрофинансовой организацией (МФО), банком или иным финансовым учреждением.</strong>
          </p>
          <p className="mb-3">
            <strong>Все решения о выдаче займа принимаются исключительно микрофинансовыми организациями. Сайт не участвует в принятии решений о кредитовании.</strong>
          </p>
          <p>
            <strong>Используя Сайт, Пользователь подтверждает, что ознакомлен с настоящим Отказом от ответственности и принимает его условия.</strong>
          </p>
        </LegalDisclaimer>

        {/* Раздел 1 */}
        <LegalSection number="1" title="Информационный характер сервиса">
          <LegalParagraph number="1.1.">
            Сайт представляет собой информационный агрегатор (витрину) кредитных предложений от микрофинансовых организаций, включённых в реестр Центрального банка Российской Федерации.
          </LegalParagraph>
          <LegalParagraph number="1.2.">
            Информация, размещённая на Сайте, носит исключительно справочный и ознакомительный характер и не является публичной офертой (ст. 437 ГК РФ).
          </LegalParagraph>
          <LegalParagraph number="1.3.">
            Администрация Сайта не гарантирует:
          </LegalParagraph>
          <LegalList items={[
            'Абсолютную точность, полноту и актуальность информации об офферах;',
            'Соответствие условий на Сайте фактическим условиям МФО на момент оформления займа;',
            'Одобрение займа какой-либо МФО.',
          ]} />
        </LegalSection>

        {/* Раздел 2 */}
        <LegalSection number="2" title="Пределы ответственности">
          <LegalParagraph number="2.1.">
            Администрация Сайта <strong>НЕ НЕСЁТ ответственности</strong> за:
          </LegalParagraph>
          <LegalList items={[
            <><strong>Решения МФО</strong> о выдаче или отказе в займе, условия кредитования;</>,
            <><strong>Качество услуг</strong>, предоставляемых микрофинансовыми организациями;</>,
            <><strong>Действия МФО</strong>, включая порядок обработки заявок, сроки рассмотрения, условия договоров;</>,
            <><strong>Расхождения</strong> между информацией на Сайте и фактическими условиями МФО;</>,
            <><strong>Убытки</strong> (прямые, косвенные, упущенную выгоду), понесённые Пользователем в результате использования информации с Сайта;</>,
            <><strong>Временную недоступность</strong> Сайта по техническим причинам;</>,
            <><strong>Содержание сайтов третьих лиц</strong>, на которые Пользователь переходит по ссылкам с Сайта.</>,
          ]} />
          <LegalParagraph number="2.2.">
            После перехода Пользователя на сайт МФО отношения возникают непосредственно между Пользователем и соответствующей микрофинансовой организацией. Администрация Сайта не является стороной таких отношений.
          </LegalParagraph>
        </LegalSection>

        {/* Раздел 3 */}
        <LegalSection number="3" title="Обработка персональных данных">
          <LegalParagraph number="3.1.">
            Администрация Сайта несёт ответственность за обработку персональных данных только в рамках настоящего Сайта.
          </LegalParagraph>
          <LegalParagraph number="3.2.">
            Администрация <strong>НЕ НЕСЁТ ответственности</strong> за порядок обработки персональных данных на сайтах третьих лиц (МФО).
          </LegalParagraph>
          <LegalParagraph number="3.3.">
            Пользователю рекомендуется самостоятельно ознакомиться с политикой конфиденциальности каждой МФО перед предоставлением персональных данных.
          </LegalParagraph>
          <LegalParagraph number="3.4.">
            Подробнее об обработке данных см. в{' '}
            <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
              Политике конфиденциальности
            </Link>.
          </LegalParagraph>
        </LegalSection>

        {/* Раздел 4 */}
        <LegalSection number="4" title="Финансовые риски">
          <LegalParagraph number="4.1.">
            Микрозаймы являются финансовым продуктом с высокими рисками для заёмщика.
          </LegalParagraph>
          <LegalParagraph number="4.2.">
            Пользователь самостоятельно несёт ответственность за:
          </LegalParagraph>
          <LegalList items={[
            'Оценку своей платёжеспособности перед оформлением займа;',
            'Изучение условий кредитного договора перед его подписанием;',
            'Своевременное погашение задолженности;',
            'Понимание последствий несвоевременного погашения (штрафы, влияние на кредитную историю).',
          ]} />
          <LegalParagraph number="4.3.">
            Администрация Сайта рекомендует внимательно ознакомиться с условиями займа перед его оформлением и не брать заём, если Вы не уверены в способности его погасить.
          </LegalParagraph>
        </LegalSection>

        {/* Раздел 5 */}
        <LegalSection number="5" title="Третьи лица">
          <LegalParagraph number="5.1.">
            Сайт содержит ссылки на сайты третьих лиц (МФО, партнёров, информационные ресурсы).
          </LegalParagraph>
          <LegalParagraph number="5.2.">
            Администрация <strong>НЕ КОНТРОЛИРУЕТ</strong> и не несёт ответственности за:
          </LegalParagraph>
          <LegalList items={[
            'Содержание, точность и актуальность информации на сайтах третьих лиц;',
            'Политику конфиденциальности и практику защиты данных на сайтах третьих лиц;',
            'Безопасность транзакций, совершаемых на сайтах третьих лиц.',
          ]} />
        </LegalSection>

        {/* Раздел 6 */}
        <LegalSection number="6" title="Интеллектуальная собственность">
          <LegalParagraph number="6.1.">
            Все материалы Сайта (тексты, изображения, дизайн, программный код) являются объектами интеллектуальной собственности Администрации или её контрагентов.
          </LegalParagraph>
          <LegalParagraph number="6.2.">
            Использование материалов Сайта без письменного согласия Администрации запрещено, за исключением случаев, предусмотренных законодательством.
          </LegalParagraph>
        </LegalSection>

        {/* Раздел 7 */}
        <LegalSection number="7" title="Изменение условий">
          <LegalParagraph number="7.1.">
            Администрация вправе изменять настоящий Отказ от ответственности без предварительного уведомления.
          </LegalParagraph>
          <LegalParagraph number="7.2.">
            Актуальная версия всегда доступна по адресу:{' '}
            <Link href="/disclaimer" className="text-primary underline-offset-4 hover:underline">
              {SITE_URL}/disclaimer
            </Link>.
          </LegalParagraph>
          <LegalParagraph number="7.3.">
            Продолжение использования Сайта после изменений означает принятие обновлённых условий.
          </LegalParagraph>
        </LegalSection>

        {/* Раздел 8 */}
        <LegalSection number="8" title="Контакты">
          <LegalParagraph>
            По всем вопросам, связанным с настоящим Отказом от ответственности, Пользователь может обратиться по адресу:
          </LegalParagraph>
          <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm mt-3">
            <p><strong>Сайт:</strong> {SITE_NAME}</p>
            <p><strong>Адрес:</strong> <Link href="/" className="text-primary underline-offset-4 hover:underline">{SITE_URL}</Link></p>
            <p><strong>Электронная почта:</strong> <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline-offset-4 hover:underline">{SUPPORT_EMAIL}</a></p>
          </div>
        </LegalSection>
      </LegalPage>
    </>
  );
}
