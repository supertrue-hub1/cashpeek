import { z } from 'zod';

/**
 * Zod схема для валидации формы жалобы
 */
export const complaintFormSchema = z.object({
  // Данные заявителя
  fullName: z
    .string()
    .min(1, 'Введите ФИО')
    .refine(
      (val) => val.trim().split(/\s+/).length >= 2,
      'ФИО должно содержать минимум 2 слова'
    ),
  
  address: z
    .string()
    .min(10, 'Адрес должен содержать минимум 10 символов'),
  
  phone: z
    .string()
    .min(1, 'Введите номер телефона')
    .refine(
      (val) => /^[\+]?[0-9\s\-\(\)]{10,}$/.test(val.replace(/\s/g, '')),
      'Неверный формат телефона'
    ),
  
  email: z
    .string()
    .min(1, 'Введите email')
    .email('Неверный формат email'),
  
  // Данные организации-нарушителя
  organizationName: z
    .string()
    .min(2, 'Название организации должно содержать минимум 2 символа'),
  
  organizationInn: z
    .string()
    .optional(),
  
  // Суть жалобы
  complaintText: z
    .string()
    .min(50, 'Текст жалобы должен содержать минимум 50 символов'),
  
  // Требования
  requirements: z
    .string()
    .min(10, 'Опишите ваши требования'),
});

/**
 * Тип данных формы жалобы (выводится из Zod схемы)
 */
export type ComplaintFormData = z.infer<typeof complaintFormSchema>;

/**
 * Интерфейс для генерации документа
 */
export interface ComplaintDocumentData {
  fullName: string;
  address: string;
  phone: string;
  email: string;
  organizationName: string;
  organizationInn?: string;
  complaintText: string;
  requirements: string;
  createdAt: Date;
}

/**
 * Данные ЦБ РФ
 */
export const CBRF_DATA = {
  name: 'Центральный банк Российской Федерации (Банк России)',
  address: '107016, г. Москва, ул. Неглинная, д. 12',
  website: 'https://www.cbr.ru',
} as const;

/**
 * Стандартные приложения к жалобе
 */
export const STANDARD_ATTACHMENTS = [
  'Копия договора займа',
  'Копии платежных документов',
  'Скриншоты переписки с МФО',
  'Иные документы, подтверждающие нарушение',
] as const;

/**
 * Стандартные просьбы к ЦБ РФ
 */
export const STANDARD_REQUESTS = [
  'провести проверку деятельности указанной организации',
  'принять меры реагирования в соответствии с законодательством РФ',
  'уведомить меня о результатах рассмотрения жалобы',
] as const;
