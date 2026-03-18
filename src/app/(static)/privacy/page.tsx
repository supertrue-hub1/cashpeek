import { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, LegalSection, LegalParagraph, LegalList } from '@/components/legal/legal-page';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности | CashPeek',
  description: 'Информация о том, как мы собираем, используем и защищаем ваши персональные данные. Политика конфиденциальности сервиса CashPeek.',
  robots: 'index, follow',
  openGraph: {
    title: 'Политика конфиденциальности | CashPeek',
    description: 'Информация о сборе, использовании и защите персональных данных на сервисе CashPeek',
    type: 'website',
  },
};

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'CashPeek';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@cashpeek.ru';
const LAST_UPDATED = '15 января 2025 г.';

// Schema.org разметка
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Политика конфиденциальности",
  "description": "Политика конфиденциальности сервиса подбора микрозаймов CashPeek",
  "url": `${SITE_URL}/privacy`,
  "isPartOf": {
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL
  },
  "dateModified": "2025-01-15",
  "inLanguage": "ru-RU"
};

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <LegalPage title="Политика конфиденциальности" lastUpdated={LAST_UPDATED}>
        {/* Раздел 1 */}
        <LegalSection number="1" title="Общие положения">
          <LegalParagraph number="1.1.">
            Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты персональных данных пользователей сайта {SITE_NAME} (далее — «Сайт», «Оператор»), расположенного по адресу {SITE_URL}.
          </LegalParagraph>
          <LegalParagraph number="1.2.">
            Политика разработана в соответствии с:
          </LegalParagraph>
          <LegalList items={[
            <>Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных»;</>,
            <>Федеральным законом от 27.07.2006 № 149-ФЗ «Об информации, информационных технологиях и о защите информации»;</>,
            <>Постановлением Правительства РФ от 01.11.2012 № 1119 «Об утверждении требований к защите персональных данных при их обработке в информационных системах персональных данных».</>,
          ]} />
          <LegalParagraph number="1.3.">
            Используя Сайт, Пользователь подтверждает, что ознакомлен с настоящей Политикой и выражает согласие на обработку своих персональных данных в описанных ниже целях и объёме.
          </LegalParagraph>
          <LegalParagraph number="1.4.">
            Оператор оставляет за собой право вносить изменения в настоящую Политику. Актуальная версия всегда доступна по адресу:{' '}
            <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
              {SITE_URL}/privacy
            </Link>.
          </LegalParagraph>
        </LegalSection>

        {/* Раздел 2 */}
        <LegalSection number="2" title="Какие данные мы собираем">
          <h3 className="text-base font-semibold text-foreground mb-2 mt-4">2.1. Данные, предоставляемые Пользователем добровольно</h3>
          <LegalParagraph>
            При регистрации и использовании функционала Сайта Пользователь может предоставить следующие данные:
          </LegalParagraph>
          <LegalList items={[
            <><strong>Адрес электронной почты</strong> — для авторизации, восстановления доступа и информационных сообщений;</>,
            <><strong>Номер телефона</strong> — опционально, для связи и уведомлений;</>,
            <><strong>Фамилия, имя, отчество</strong> — опционально, для персонализации аккаунта.</>,
          ]} />

          <h3 className="text-base font-semibold text-foreground mb-2 mt-4">2.2. Данные, собираемые автоматически</h3>
          <LegalParagraph>
            При посещении Сайта автоматически собираются следующие технические данные:
          </LegalParagraph>
          <LegalList items={[
            <><strong>IP-адрес</strong> устройства Пользователя;</>,
            <><strong>Тип и версия браузера</strong>, операционная система;</>,
            <><strong>Дата и время посещения</strong>, продолжительность сессии;</>,
            <><strong>Адрес посещённой страницы</strong> (URL), реферер (источник перехода);</>,
            <><strong>Данные об устройстве</strong> (тип устройства, разрешение экрана, язык интерфейса).</>,
          ]} />

          <h3 className="text-base font-semibold text-foreground mb-2 mt-4">2.3. Данные, хранящиеся в браузере Пользователя</h3>
          <LegalParagraph>
            Сайт использует localStorage для хранения:
          </LegalParagraph>
          <LegalList items={[
            <><strong>Истории просмотренных предложений</strong> (офферов МФО);</>,
            <><strong>Списка избранных предложений</strong> (избранное);</>,
            <><strong>Настроек интерфейса</strong> (выбранная тема, фильтры подбора);</>,
            <><strong>Идентификатора гостевой сессии</strong> (для сохранения данных незарегистрированных пользователей).</>,
          ]} />
          <LegalParagraph>
            Данные localStorage хранятся исключительно на устройстве Пользователя и не передаются на сервер без явного действия Пользователя.
          </LegalParagraph>

          <h3 className="text-base font-semibold text-foreground mb-2 mt-4">2.4. Данные, передаваемые при оформлении заявки</h3>
          <LegalParagraph>
            При нажатии Пользователем кнопки «Получить займ» или «Оформить заявку» на сайте МФО могут передаваться следующие данные:
          </LegalParagraph>
          <LegalList items={[
            'Идентификатор выбранного предложения;',
            'Параметры подбора (желаемая сумма, срок займа);',
            'Иные данные, указанные Пользователем на сайте МФО.',
          ]} />
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 my-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Важно:</strong> Передача данных на сайты третьих лиц (МФО) происходит только при явном согласии Пользователя, выраженном путём нажатия соответствующей кнопки и перехода на сайт кредитной организации.
            </p>
          </div>
        </LegalSection>

        {/* Раздел 3 */}
        <LegalSection number="3" title="Цели обработки данных">
          <LegalParagraph number="3.1.">
            Оператор обрабатывает персональные данные в следующих целях:
          </LegalParagraph>
          
          {/* Таблица целей */}
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border border-border rounded-lg">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 border-b border-border font-medium">Цель обработки</th>
                  <th className="text-left p-3 border-b border-border font-medium">Категории данных</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3">Предоставление функционала Сайта (авторизация, личный кабинет)</td>
                  <td className="p-3">Email, телефон, ФИО</td>
                </tr>
                <tr>
                  <td className="p-3">Сохранение настроек и предпочтений Пользователя</td>
                  <td className="p-3">Данные localStorage</td>
                </tr>
                <tr>
                  <td className="p-3">Улучшение качества сервиса и пользовательского опыта</td>
                  <td className="p-3">Технические данные, история просмотров</td>
                </tr>
                <tr>
                  <td className="p-3">Персонализация подборки займов</td>
                  <td className="p-3">История поиска, избранные предложения</td>
                </tr>
                <tr>
                  <td className="p-3">Направление информационных и сервисных сообщений</td>
                  <td className="p-3">Email, телефон (с согласия)</td>
                </tr>
                <tr>
                  <td className="p-3">Обеспечение безопасности Сайта и предотвращение злоупотреблений</td>
                  <td className="p-3">IP-адрес, данные устройства</td>
                </tr>
                <tr>
                  <td className="p-3">Аналитика посещаемости и поведения пользователей</td>
                  <td className="p-3">Технические данные, cookies</td>
                </tr>
              </tbody>
            </table>
          </div>

          <LegalParagraph number="3.2.">
            Обработка персональных данных осуществляется на основании:
          </LegalParagraph>
          <LegalList items={[
            'Согласия Пользователя (ст. 9 Закона № 152-ФЗ);',
            'Договора, стороной которого является Пользователь (ст. 6 Закона № 152-ФЗ);',
            'Законных интересов Оператора (ст. 6 Закона № 152-ФЗ).',
          ]} />
        </LegalSection>

        {/* Раздел 4 */}
        <LegalSection number="4" title="Передача данных третьим лицам">
          <h3 className="text-base font-semibold text-foreground mb-2 mt-4">4.1. Передача микрофинансовым организациям (МФО)</h3>
          <LegalParagraph number="4.1.1.">
            Сайт является агрегатором кредитных предложений. При переходе Пользователя по ссылке на сайт МФО данные могут передаваться соответствующей организации.
          </LegalParagraph>
          <LegalParagraph number="4.1.2.">
            Оператор <strong>не контролирует и не несёт ответственности</strong> за порядок обработки персональных данных на сайтах третьих лиц (МФО). После перехода на сайт МФО отношения по обработке персональных данных возникают непосредственно между Пользователем и соответствующей МФО.
          </LegalParagraph>
          <LegalParagraph number="4.1.3.">
            Пользователю рекомендуется ознакомиться с политикой конфиденциальности каждой МФО перед предоставлением персональных данных на её сайте.
          </LegalParagraph>

          <h3 className="text-base font-semibold text-foreground mb-2 mt-4">4.2. Передача аналитическим сервисам</h3>
          <LegalParagraph>
            Оператор использует следующие сервисы аналитики:
          </LegalParagraph>
          <LegalList items={[
            <><strong>Яндекс.Метрика</strong> — для анализа посещаемости и поведения пользователей;</>,
            <><strong>Google Analytics</strong> — для анализа трафика и эффективности контента.</>,
          ]} />
          <LegalParagraph>
            Указанные сервисы обрабатывают данные в соответствии с собственными политиками конфиденциальности. Пользователь может отключить отслеживание в настройках браузера.
          </LegalParagraph>

          <h3 className="text-base font-semibold text-foreground mb-2 mt-4">4.3. Иные случаи передачи</h3>
          <LegalParagraph>
            Оператор может передавать персональные данные третьим лицам в следующих случаях:
          </LegalParagraph>
          <LegalList items={[
            'При наличии письменного согласия Пользователя;',
            'По запросу уполномоченных государственных органов в установленном законом порядке;',
            'Для защиты прав, собственности и безопасности Оператора, Пользователей и иных лиц.',
          ]} />
        </LegalSection>

        {/* Раздел 5 */}
        <LegalSection number="5" title="Использование файлов Cookie">
          <h3 className="text-base font-semibold text-foreground mb-2 mt-4">5.1. Что такое cookies</h3>
          <LegalParagraph>
            Cookies (куки) — это небольшие текстовые файлы, которые сохраняются на устройстве Пользователя при посещении Сайта. Они позволяют распознать устройство при повторных посещениях.
          </LegalParagraph>

          <h3 className="text-base font-semibold text-foreground mb-2 mt-4">5.2. Типы используемых cookies</h3>
          
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border border-border rounded-lg">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 border-b border-border font-medium">Тип cookies</th>
                  <th className="text-left p-3 border-b border-border font-medium">Назначение</th>
                  <th className="text-left p-3 border-b border-border font-medium">Срок хранения</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 font-medium">Технические (обязательные)</td>
                  <td className="p-3">Обеспечение работоспособности Сайта, авторизация, безопасность</td>
                  <td className="p-3">Сессия / до 1 года</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Функциональные</td>
                  <td className="p-3">Сохранение настроек интерфейса, языка, темы</td>
                  <td className="p-3">До 1 года</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Аналитические</td>
                  <td className="p-3">Сбор статистики посещаемости, анализ поведения</td>
                  <td className="p-3">До 2 лет</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Рекламные</td>
                  <td className="p-3">Персонализация рекламных предложений</td>
                  <td className="p-3">До 1 года</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-semibold text-foreground mb-2 mt-4">5.3. Управление cookies</h3>
          <LegalParagraph>
            Пользователь может отключить сохранение cookies в настройках браузера. При этом некоторые функции Сайта могут стать недоступны.
          </LegalParagraph>

          <h3 className="text-base font-semibold text-foreground mb-2 mt-4">5.4. Согласие на использование cookies</h3>
          <LegalParagraph>
            При первом посещении Сайта Пользователю предлагается дать согласие на использование cookies. Продолжение использования Сайта без изменения настроек браузера считается согласием на обработку cookies.
          </LegalParagraph>
        </LegalSection>

        {/* Раздел 6 */}
        <LegalSection number="6" title="Меры безопасности">
          <LegalParagraph number="6.1.">
            Оператор принимает следующие меры для защиты персональных данных:
          </LegalParagraph>
          <LegalList items={[
            <><strong>Шифрование данных</strong> — передача данных между браузером Пользователя и сервером осуществляется по защищённому протоколу HTTPS (TLS 1.2/1.3);</>,
            <><strong>Ограничение доступа</strong> — доступ к персональным данным имеют только уполномоченные сотрудники, обязанные сохранять конфиденциальность;</>,
            <><strong>Мониторинг безопасности</strong> — регулярная проверка систем на наличие уязвимостей;</>,
            <><strong>Резервное копирование</strong> — создание резервных копий данных для их восстановления в случае сбоев;</>,
            <><strong>Анонимизация</strong> — обезличивание данных при использовании их в аналитических целях.</>,
          ]} />
          <LegalParagraph number="6.2.">
            Оператор не гарантирует абсолютную безопасность передачи данных через Интернет. Пользователь несёт ответственность за сохранность своих учётных данных (логина и пароля).
          </LegalParagraph>
        </LegalSection>

        {/* Раздел 7 */}
        <LegalSection number="7" title="Права пользователя">
          <LegalParagraph number="7.1.">
            Пользователь имеет право:
          </LegalParagraph>
          <LegalList items={[
            <><strong>Получить информацию</strong> об обработке своих персональных данных;</>,
            <><strong>Запросить копию</strong> своих персональных данных;</>,
            <><strong>Требовать уточнения</strong> неполных или неточных данных;</>,
            <><strong>Требовать удаления</strong> персональных данных (при отсутствии законных оснований для их хранения);</>,
            <><strong>Отозвать согласие</strong> на обработку персональных данных;</>,
            <><strong>Ограничить обработку</strong> персональных данных в установленных законом случаях;</>,
            <><strong>Подать жалобу</strong> в уполномоченный орган (Роскомнадзор) при нарушении прав.</>,
          ]} />
          <LegalParagraph number="7.2.">
            Для реализации прав Пользователю необходимо направить запрос на адрес электронной почты:{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline-offset-4 hover:underline">
              {SUPPORT_EMAIL}
            </a>.
          </LegalParagraph>
          <LegalParagraph number="7.3.">
            Оператор обязуется рассмотреть обращение в срок, не превышающий 30 (тридцати) дней с момента его получения.
          </LegalParagraph>
        </LegalSection>

        {/* Раздел 8 */}
        <LegalSection number="8" title="Хранение данных">
          <LegalParagraph number="8.1.">
            Персональные данные хранятся на серверах, расположенных на территории Российской Федерации.
          </LegalParagraph>
          <LegalParagraph number="8.2.">
            Срок хранения персональных данных:
          </LegalParagraph>
          <LegalList items={[
            'Данные аккаунта — до удаления аккаунта Пользователем или прекращения работы Сайта;',
            'Технические данные — до 2 лет с момента последнего посещения;',
            'Данные localStorage — до удаления Пользователем или очистки браузера.',
          ]} />
          <LegalParagraph number="8.3.">
            При достижении целей обработки или по истечении срока хранения персональные данные подлежат уничтожению или обезличиванию.
          </LegalParagraph>
        </LegalSection>

        {/* Раздел 9 */}
        <LegalSection number="9" title="Дети">
          <LegalParagraph number="9.1.">
            Сайт не предназначен для лиц, не достигших возраста 18 лет.
          </LegalParagraph>
          <LegalParagraph number="9.2.">
            Оператор не собирает и не обрабатывает персональные данные несовершеннолетних лиц. В случае обнаружения таких данных они будут незамедлительно удалены.
          </LegalParagraph>
        </LegalSection>

        {/* Раздел 10 */}
        <LegalSection number="10" title="Заключительные положения">
          <LegalParagraph number="10.1.">
            Все спорные вопросы, связанные с обработкой персональных данных, решаются путём переговоров.
          </LegalParagraph>
          <LegalParagraph number="10.2.">
            При невозможности достичь согласия спор передаётся на рассмотрение в суд по месту нахождения Оператора.
          </LegalParagraph>
          <LegalParagraph number="10.3.">
            По всем вопросам, связанным с настоящей Политикой, Пользователь может обратиться по адресу:{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline-offset-4 hover:underline">
              {SUPPORT_EMAIL}
            </a>.
          </LegalParagraph>
        </LegalSection>

        {/* Раздел 11 */}
        <LegalSection number="11" title="Контакты">
          <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
            <p><strong>Сайт:</strong> {SITE_NAME}</p>
            <p><strong>Адрес:</strong> <Link href="/" className="text-primary underline-offset-4 hover:underline">{SITE_URL}</Link></p>
            <p><strong>Электронная почта:</strong> <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline-offset-4 hover:underline">{SUPPORT_EMAIL}</a></p>
          </div>
        </LegalSection>
      </LegalPage>
    </>
  );
}
