'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, FileText, AlertCircle, CheckCircle2, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { complaintFormSchema, type ComplaintFormData } from '@/types/complaint';
import { generateComplaintDoc } from '@/utils/generateComplaintDoc';

interface ComplaintFormProps {
  onSuccess?: () => void;
}

export function ComplaintForm({ onSuccess }: ComplaintFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      fullName: '',
      address: '',
      phone: '',
      email: '',
      organizationName: '',
      organizationInn: '',
      complaintText: '',
      requirements: '',
    },
  });

  const onSubmit = async (data: ComplaintFormData) => {
    setIsSubmitting(true);
    
    try {
      // Генерируем и скачиваем документ
      await generateComplaintDoc({
        ...data,
        createdAt: new Date(),
      });

      setIsSuccess(true);
      toast.success('Документ успешно сформирован и скачан');
      
      // Сбрасываем форму
      form.reset();
      
      onSuccess?.();
    } catch (error) {
      console.error('Error generating complaint:', error);
      toast.error('Ошибка при формировании документа');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center py-8">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Жалоба сформирована!</h3>
            <p className="text-muted-foreground mb-4">
              Документ успешно скачан. Распечатайте, подпишите и отправьте в ЦБ РФ.
            </p>
            <Button
              variant="outline"
              onClick={() => setIsSuccess(false)}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Сформировать ещё одну жалобу
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* === ДАННЫЕ ЗАЯВИТЕЛЯ === */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Данные заявителя</CardTitle>
            <CardDescription>
              Ваши контактные данные для связи и указания в жалобе
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>ФИО *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Иванов Иван Иванович"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Полностью, без сокращений
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Адрес регистрации *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="г. Москва, ул. Примерная, д. 1, кв. 1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Телефон *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+7 999 123-45-67"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* === ОРГАНИЗАЦИЯ-НАРУШИТЕЛЬ === */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Организация-нарушитель</CardTitle>
            <CardDescription>
              Данные банка или МФО, на которую подаётся жалоба
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название организации *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='ООО "МФО Пример"'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizationInn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ИНН организации</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1234567890"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Необязательно, но ускорит рассмотрение
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* === СУТЬ ЖАЛОБЫ === */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Суть жалобы</CardTitle>
            <CardDescription>
              Подробно опишите факты нарушения ваших прав
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="complaintText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Текст жалобы *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Опишите факты нарушения: что произошло, когда, при каких обстоятельствах..."
                      className="min-h-[200px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Минимум 50 символов. Опишите факты, даты, суммы, действия организации.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Совет</AlertTitle>
              <AlertDescription>
                Указывайте конкретные факты: даты, суммы, номера договоров. 
                Избегайте эмоциональных высказываний.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* === ТРЕБОВАНИЯ === */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Требования заявителя</CardTitle>
            <CardDescription>
              Что вы просите у ЦБ РФ в отношении данной организации
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ваши требования *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="1. Признать действия организации неправомерными&#10;2. Обязать вернуть излишне уплаченные проценты&#10;3. Внести организацию в реестр нарушителей"
                      className="min-h-[120px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Каждое требование с новой строки. Стандартные просьбы (проверка, меры реагирования) будут добавлены автоматически.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* === КНОПКА ОТПРАВКИ === */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Очистить форму
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2 min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Формирование...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Сформировать жалобу
              </>
            )}
          </Button>
        </div>

        {/* === ПРИМЕЧАНИЕ === */}
        <Alert className="bg-blue-500/5 border-blue-500/20">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertTitle>Важно</AlertTitle>
          <AlertDescription>
            После формирования документа его нужно распечатать, подписать и отправить:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Почтой России по адресу: 107016, г. Москва, ул. Неглинная, д. 12</li>
              <li>Через интернет-приёмную ЦБ РФ: <a href="https://www.cbr.ru/Reception/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">www.cbr.ru/Reception</a></li>
              <li>Лично в территориальном учреждении ЦБ РФ</li>
            </ul>
          </AlertDescription>
        </Alert>
      </form>
    </Form>
  );
}
