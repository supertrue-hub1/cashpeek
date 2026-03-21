'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useReviews, useReviewHydrated } from '@/lib/store/use-review-store';

// ============================================
// Zod Schema
// ============================================

const reviewSchema = z.object({
  author: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя слишком длинное'),
  rating: z
    .number()
    .min(1, 'Поставьте оценку')
    .max(5, 'Максимум 5 звёзд'),
  text: z
    .string()
    .min(10, 'Отзыв должен содержать минимум 10 символов')
    .max(1000, 'Отзыв слишком длинный (максимум 1000 символов)'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

// ============================================
// Star Rating Input
// ============================================

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function StarRatingInput({ value, onChange, disabled }: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className="focus:outline-none disabled:cursor-not-allowed"
          onMouseEnter={() => !disabled && setHoverValue(star)}
          onMouseLeave={() => setHoverValue(null)}
          onClick={() => !disabled && onChange(star)}
        >
          <Star
            className={cn(
              'h-8 w-8 transition-all duration-150',
              (hoverValue ?? value) >= star
                ? 'fill-yellow-400 text-yellow-400 scale-110'
                : 'fill-transparent text-muted-foreground/30 hover:text-yellow-300'
            )}
          />
        </button>
      ))}
    </div>
  );
}

// ============================================
// Review Form Component
// ============================================

interface ReviewFormProps {
  mfoId: string;
  mfoName: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ReviewForm({ mfoId, mfoName, trigger, onSuccess }: ReviewFormProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const hydrated = useReviewHydrated();
  const { addReview } = useReviews();
  
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      author: '',
      rating: 0,
      text: '',
    },
  });
  
  const rating = form.watch('rating');
  
  const onSubmit = async (data: ReviewFormData) => {
    if (!hydrated) {
      toast.error('Подождите, идёт загрузка...');
      return;
    }
    
    setIsSubmitting(true);
    
    // Имитация задержки для UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    try {
      const review = addReview({
        offerId: mfoId,
        author: data.author,
        rating: data.rating,
        text: data.text,
        verified: false,
        helpful: 0,
      });
      
      // Успех
      toast.success('Спасибо за отзыв!', {
        description: 'Ваш отзыв сохранён и поможет другим пользователям.',
      });
      
      form.reset();
      setOpen(false);
      onSuccess?.();
      
    } catch (error) {
      toast.error('Ошибка', {
        description: 'Не удалось сохранить отзыв. Попробуйте позже.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Star className="h-4 w-4" />
            Оставить отзыв
          </Button>
        )}
      </DialogTrigger>
      
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Отзыв о {mfoName}</DialogTitle>
              <DialogDescription>
                Поделитесь своим опытом — это поможет другим пользователям
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                {/* Имя */}
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ваше имя</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Как к вам обращаться?"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Рейтинг */}
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Оценка</FormLabel>
                      <FormControl>
                        <StarRatingInput
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      {rating === 0 && (
                        <p className="text-sm text-destructive">
                          Поставьте оценку от 1 до 5 звёзд
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                
                {/* Текст отзыва */}
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ваш отзыв</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Опишите ваш опыт работы с этой МФО..."
                          className="min-h-[120px] resize-none"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center">
                        <FormMessage />
                        <span className="text-xs text-muted-foreground">
                          {field.value.length}/1000
                        </span>
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Submit */}
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isSubmitting}
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Отправить
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
