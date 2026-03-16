import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  Packer,
} from 'docx';
import { saveAs } from 'file-saver';
import type { ComplaintDocumentData, CBRF_DATA, STANDARD_ATTACHMENTS, STANDARD_REQUESTS } from '@/types/complaint';

/**
 * Форматирует дату в русском формате
 */
function formatDateRu(date: Date): string {
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year} г.`;
}

/**
 * Получает инициалы из ФИО
 */
function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 3) {
    return `${parts[0]} ${parts[1][0]}.${parts[2][0]}.`;
  } else if (parts.length === 2) {
    return `${parts[0]} ${parts[1][0]}.`;
  }
  return parts[0];
}

/**
 * Получает фамилию и инициалы для подписи
 */
function getShortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 3) {
    return `${parts[0]} ${parts[1][0]}.${parts[2][0]}.`;
  } else if (parts.length === 2) {
    return `${parts[0]} ${parts[1][0]}.`;
  }
  return parts[0];
}

/**
 * Генерирует Word документ с жалобой
 */
export async function generateComplaintDoc(data: ComplaintDocumentData): Promise<void> {
  const {
    fullName,
    address,
    phone,
    email,
    organizationName,
    organizationInn,
    complaintText,
    requirements,
    createdAt,
  } = data;

  // Создаём документ
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.5),
            },
          },
        },
        children: [
          // === ШАПКА ===
          // Кому
          new Paragraph({
            children: [
              new TextRun({
                text: 'В Центральный банк Российской Федерации (Банк России)',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '107016, г. Москва, ул. Неглинная, д. 12',
              }),
            ],
          }),
          
          // Пустая строка
          new Paragraph({ children: [] }),
          
          // От кого
          new Paragraph({
            children: [
              new TextRun({
                text: 'От:',
                bold: true,
              }),
              new TextRun({
                text: ` ${fullName}`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Адрес:',
                bold: true,
              }),
              new TextRun({
                text: ` ${address}`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Тел.:',
                bold: true,
              }),
              new TextRun({
                text: ` ${phone}`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Email:',
                bold: true,
              }),
              new TextRun({
                text: ` ${email}`,
              }),
            ],
          }),
          
          // Пустые строки
          new Paragraph({ children: [] }),
          new Paragraph({ children: [] }),
          
          // === ЗАГОЛОВОК ===
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
            children: [
              new TextRun({
                text: 'ЖАЛОБА',
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
            children: [
              new TextRun({
                text: `на действия ${organizationName}`,
                bold: true,
                size: 24,
              }),
            ],
          }),
          
          // === ОПИСАТЕЛЬНАЯ ЧАСТЬ ===
          new Paragraph({
            spacing: {
              after: 200,
            },
            children: [
              new TextRun({
                text: 'ОПИСАТЕЛЬНАЯ ЧАСТЬ',
                bold: true,
              }),
            ],
          }),
          
          // Текст жалобы (разбиваем на параграфы)
          ...complaintText.split('\n').filter(p => p.trim()).map(paragraph =>
            new Paragraph({
              spacing: {
                after: 200,
              },
              indent: {
                firstLine: convertInchesToTwip(0.5),
              },
              children: [
                new TextRun({
                  text: paragraph.trim(),
                }),
              ],
            })
          ),
          
          // Пустая строка
          new Paragraph({ children: [] }),
          
          // === ПРОСИТЕЛЬНАЯ ЧАСТЬ ===
          new Paragraph({
            spacing: {
              after: 200,
            },
            children: [
              new TextRun({
                text: 'ПРОСИТЕЛЬНАЯ ЧАСТЬ',
                bold: true,
              }),
            ],
          }),
          
          new Paragraph({
            spacing: {
              after: 200,
            },
            indent: {
              firstLine: convertInchesToTwip(0.5),
            },
            children: [
              new TextRun({
                text: 'На основании изложенного, руководствуясь Федеральным законом от 02.03.2007 № 25-ФЗ «О деятельности по взысканию просроченной задолженности», Федеральным законом от 21.12.2013 № 353-ФЗ «О потребительском кредите (займе)», а также иными нормативными правовыми актами Российской Федерации,',
              }),
            ],
          }),
          
          new Paragraph({
            spacing: {
              after: 100,
            },
            children: [
              new TextRun({
                text: 'ПРОШУ:',
                bold: true,
              }),
            ],
          }),
          
          // Требования пользователя
          ...requirements.split('\n').filter(p => p.trim()).map((req, index) =>
            new Paragraph({
              spacing: {
                after: 100,
              },
              indent: {
                left: convertInchesToTwip(0.5),
              },
              children: [
                new TextRun({
                  text: `${index + 1}. ${req.trim().replace(/^[0-9]+\.\s*/, '')}`,
                }),
              ],
            })
          ),
          
          // Стандартные просьбы
          new Paragraph({
            spacing: {
              before: 100,
              after: 100,
            },
            indent: {
              left: convertInchesToTwip(0.5),
            },
            children: [
              new TextRun({
                text: `${requirements.split('\n').filter(p => p.trim()).length + 1}. провести проверку деятельности указанной организации;`,
              }),
            ],
          }),
          new Paragraph({
            spacing: {
              after: 100,
            },
            indent: {
              left: convertInchesToTwip(0.5),
            },
            children: [
              new TextRun({
                text: `${requirements.split('\n').filter(p => p.trim()).length + 2}. принять меры реагирования в соответствии с законодательством РФ;`,
              }),
            ],
          }),
          new Paragraph({
            spacing: {
              after: 100,
            },
            indent: {
              left: convertInchesToTwip(0.5),
            },
            children: [
              new TextRun({
                text: `${requirements.split('\n').filter(p => p.trim()).length + 3}. уведомить меня о результатах рассмотрения жалобы.`,
              }),
            ],
          }),
          
          // Пустая строка
          new Paragraph({ children: [] }),
          
          // === ПРИЛОЖЕНИЯ ===
          new Paragraph({
            spacing: {
              after: 200,
            },
            children: [
              new TextRun({
                text: 'Приложения:',
                bold: true,
              }),
            ],
          }),
          
          new Paragraph({
            spacing: {
              after: 50,
            },
            indent: {
              left: convertInchesToTwip(0.5),
            },
            children: [
              new TextRun({
                text: '1. Копия договора займа (при наличии);',
              }),
            ],
          }),
          new Paragraph({
            spacing: {
              after: 50,
            },
            indent: {
              left: convertInchesToTwip(0.5),
            },
            children: [
              new TextRun({
                text: '2. Копии платёжных документов (при наличии);',
              }),
            ],
          }),
          new Paragraph({
            spacing: {
              after: 50,
            },
            indent: {
              left: convertInchesToTwip(0.5),
            },
            children: [
              new TextRun({
                text: '3. Скриншоты переписки с организацией (при наличии);',
              }),
            ],
          }),
          new Paragraph({
            spacing: {
              after: 200,
            },
            indent: {
              left: convertInchesToTwip(0.5),
            },
            children: [
              new TextRun({
                text: '4. Иные документы, подтверждающие изложенные факты.',
              }),
            ],
          }),
          
          // Пустые строки
          new Paragraph({ children: [] }),
          new Paragraph({ children: [] }),
          
          // === ПОДПИСЬ ===
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: formatDateRu(createdAt),
              }),
            ],
          }),
          
          new Paragraph({ children: [] }),
          
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: '_____________',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `/${getShortName(fullName)}/`,
              }),
            ],
          }),
          
          new Paragraph({ children: [] }),
          
          // Примечание
          new Paragraph({
            spacing: {
              before: 400,
            },
            children: [
              new TextRun({
                text: '* Документ сформирован автоматически с помощью сервиса подачи жалоб в ЦБ РФ.',
                italics: true,
                size: 18,
                color: '666666',
              }),
            ],
          }),
        ],
      },
    ],
  });

  // Генерируем и скачиваем документ
  const blob = await Packer.toBlob(doc);
  
  // Формируем имя файла
  const fileName = `Жалоба_ЦБ_РФ_${fullName.replace(/\s+/g, '_')}_${formatDateForFilename(createdAt)}.docx`;
  
  saveAs(blob, fileName);
}

/**
 * Форматирует дату для имени файла
 */
function formatDateForFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
