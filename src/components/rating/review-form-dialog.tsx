'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from './star-rating';
import { useRatingStore } from '@/lib/store/use-rating-store';
import { toast } from 'sonner';

const reviewSchema = z.object({
  author: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя слишком длинное'),
  rating: z.number().min(1, 'Поставьте оценку').max(5),
  text: z
    .string()
    .min(20, 'Отзыв должен содержать минимум 20 символов')
    .max(2000, 'Отзыв слишком длинный (максимум 2000 символов)'),
  pros: z.string().max(500, 'Слишком длинный текст').optional(),
  cons: z.string().max(500, 'Слишком длинный текст').optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mfoId: string;
  mfoName: string;
}

export function ReviewFormDialog({
  open,
  onOpenChange,
  mfoId,
  mfoName,
}: ReviewFormDialogProps) {
  const addReview = useRatingStore((state) => state.addReview);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      author: '',
      rating: 0,
      text: '',
      pros: '',
      cons: '',
    },
  });

  const rating = watch('rating');

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);

    // Имитация задержки для UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    addReview({
      mfoId,
      mfoName,
      author: data.author,
      rating: data.rating,
      text: data.text,
      pros: data.pros || undefined,
      cons: data.cons || undefined,
      isVerified: false, // По умолчанию не верифицирован
    });

    setIsSubmitting(false);
    reset();
    onOpenChange(false);
    toast.success('Отзыв добавлен', {
      description: 'Спасибо за ваш отзыв! Он появится в рейтинге после модерации.',
    });
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Оставить отзыв о {mfoName}</DialogTitle>
          <DialogDescription>
            Поделитесь своим опытом получения займа в этой МФО
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating">
              Оценка <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-4">
              <StarRating
                value={rating}
                onChange={(value) => setValue('rating', value, { shouldValidate: true })}
                size="lg"
              />
              <span className="text-sm text-muted-foreground">
                {rating > 0 ? `${rating} из 5` : 'Выберите оценку'}
              </span>
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating.message}</p>
            )}
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author">
              Ваше имя <span className="text-destructive">*</span>
            </Label>
            <Input
              id="author"
              placeholder="Как к вам обращаться?"
              {...register('author')}
              aria-invalid={!!errors.author}
            />
            {errors.author && (
              <p className="text-sm text-destructive">{errors.author.message}</p>
            )}
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="text">
              Ваш отзыв <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="text"
              placeholder="Расскажите о своём опыте: как быстро одобрили, какие были условия..."
              rows={4}
              {...register('text')}
              aria-invalid={!!errors.text}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Минимум 20 символов</span>
              <span>{watch('text').length} / 2000</span>
            </div>
            {errors.text && (
              <p className="text-sm text-destructive">{errors.text.message}</p>
            )}
          </div>

          {/* Pros & Cons */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pros">Плюсы</Label>
              <Input
                id="pros"
                placeholder="Что понравилось?"
                {...register('pros')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cons">Минусы</Label>
              <Input
                id="cons"
                placeholder="Что не понравилось?"
                {...register('cons')}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting || rating === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Отправить отзыв
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
