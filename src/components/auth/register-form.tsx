'use client';

import * as React from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { register } from '@/app/actions/auth';

const registerSchema = z.object({
  name: z.string().min(2, 'Имя минимум 2 символа').optional(),
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль минимум 6 символов'),
  agree: z.boolean().refine((val) => val === true, {
    message: 'Необходимо принять условия',
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess: (callbackUrl?: string) => void;
  onSwitchToLogin: () => void;
  isProcessing?: boolean;
}

export function RegisterForm({ onSuccess, onSwitchToLogin, isProcessing }: RegisterFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      agree: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Создаём пользователя
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      if (data.name) formData.append('name', data.name);

      const result = await register(formData);

      if (!result.success) {
        setError(result.error || 'Ошибка при регистрации');
        setIsLoading(false);
        return;
      }

      // Автоматический вход после регистрации
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError('Аккаунт создан, но войти не удалось. Попробуйте войти вручную.');
        setIsLoading(false);
        return;
      }

      // Получаем callbackUrl из URL
      const url = new URL(window.location.href);
      const callbackUrl = url.searchParams.get('callbackUrl') || '/cabinet';

      // Небольшая задержка для установки cookies
      setTimeout(() => {
        window.location.href = callbackUrl;
      }, 300);
    } catch (err) {
      setError('Произошла ошибка. Попробуйте позже.');
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || isProcessing;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">Создать аккаунт</h2>
        <p className="text-sm text-muted-foreground">
          Регистрация займёт меньше минуты
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Имя (необязательно)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="text"
                      placeholder="Иван"
                      className="pl-10"
                      disabled={isDisabled}
                      autoComplete="name"
                    />
                  </div>
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="example@mail.ru"
                      className="pl-10"
                      disabled={isDisabled}
                      autoComplete="email"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Пароль</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="password"
                      placeholder="Минимум 6 символов"
                      className="pl-10"
                      disabled={isDisabled}
                      autoComplete="new-password"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="agree"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isDisabled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal cursor-pointer">
                    Принимаю{' '}
                    <a href="/terms" className="text-primary hover:underline">
                      условия использования
                    </a>{' '}
                    и{' '}
                    <a href="/privacy" className="text-primary hover:underline">
                      политику конфиденциальности
                    </a>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isDisabled}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Регистрация...
              </>
            ) : (
              <>
                Создать аккаунт
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            или
          </span>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary hover:underline font-medium"
          disabled={isDisabled}
        >
          Войти
        </button>
      </p>
    </div>
  );
}
