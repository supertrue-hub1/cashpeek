/**
 * Server Actions для аутентификации
 * 'use server' обязателен
 */

'use server';

import { getServerSession } from 'next-auth';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hash } from 'bcrypt';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// ============================================
// Схемы валидации
// ============================================

const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль минимум 6 символов'),
  name: z.string().min(2, 'Имя минимум 2 символа').optional(),
});

const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

// ============================================
// Types
// ============================================

export interface GuestData {
  guestId: string;
  favorites: Array<{
    offerId: string;
    offerExternalId?: string;
    note?: string;
    createdAt: string;
  }>;
  searchHistory: Array<{
    query?: string;
    city?: string;
    amount?: number;
    term?: number;
    filters?: string;
    resultsCount?: number;
    createdAt: string;
  }>;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// Registration
// ============================================

export async function register(
  formData: FormData
): Promise<ActionResult<{ userId: string }>> {
  try {
    const rawData = {
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
    };

    const validated = registerSchema.parse(rawData);

    // Проверяем, существует ли пользователь
    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'Пользователь с таким email уже существует',
      };
    }

    // Хешируем пароль
    const hashedPassword = await hash(validated.password, 10);

    // Создаем пользователя
    const user = await db.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name || null,
        role: 'user',
      },
    });

    revalidatePath('/');

    return {
      success: true,
      data: { userId: user.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Ошибка валидации',
      };
    }

    console.error('[Register Error]', error);
    return {
      success: false,
      error: 'Ошибка при регистрации',
    };
  }
}

// ============================================
// Login
// ============================================

export async function login(
  formData: FormData
): Promise<ActionResult<{ userId: string }>> {
  try {
    const rawData = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    const validated = loginSchema.parse(rawData);

    // Проверяем пользователя
    const user = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (!user || !user.password) {
      return {
        success: false,
        error: 'Неверный email или пароль',
      };
    }

    const isPasswordValid = await hash(validated.password, 10).then(() => 
      import('bcrypt').then(bcrypt => bcrypt.compare(validated.password, user.password!))
    );

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Неверный email или пароль',
      };
    }

    revalidatePath('/');

    return {
      success: true,
      data: { userId: user.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Ошибка валидации',
      };
    }

    console.error('[Login Error]', error);
    return {
      success: false,
      error: 'Ошибка при входе',
    };
  }
}

// ============================================
// Logout
// ============================================

export async function logout(): Promise<ActionResult> {
  try {
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('[Logout Error]', error);
    return {
      success: false,
      error: 'Ошибка при выходе',
    };
  }
}

// ============================================
// Sync Guest Data
// ============================================

export async function syncGuestData(
  guestData: GuestData
): Promise<ActionResult<{ favoritesMigrated: number; historyMigrated: number }>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Не авторизован',
      };
    }

    const userId = session.user.id;

    // Проверяем, была ли уже миграция для этого гостя
    const existingMigration = await db.guestMigration.findFirst({
      where: { guestId: guestData.guestId },
    });

    if (existingMigration) {
      return {
        success: true,
        data: {
          favoritesMigrated: 0,
          historyMigrated: 0,
        },
      };
    }

    // Используем транзакцию для атомарной миграции
    const result = await db.$transaction(async (tx) => {
      // Миграция избранного
      let favoritesMigrated = 0;
      if (guestData.favorites.length > 0) {
        for (const fav of guestData.favorites) {
          // Проверяем, не существует ли уже такой записи
          const existing = await tx.favoriteOffer.findUnique({
            where: {
              userId_offerId: {
                userId,
                offerId: fav.offerId,
              },
            },
          });

          if (!existing) {
            await tx.favoriteOffer.create({
              data: {
                userId,
                offerId: fav.offerId,
                offerExternalId: fav.offerExternalId,
                note: fav.note,
                createdAt: new Date(fav.createdAt),
              },
            });
            favoritesMigrated++;
          }
        }
      }

      // Миграция истории поиска
      let historyMigrated = 0;
      if (guestData.searchHistory.length > 0) {
        for (const item of guestData.searchHistory) {
          await tx.searchHistory.create({
            data: {
              userId,
              query: item.query,
              city: item.city,
              amount: item.amount,
              term: item.term,
              filters: item.filters,
              resultsCount: item.resultsCount,
              createdAt: new Date(item.createdAt),
            },
          });
          historyMigrated++;
        }
      }

      // Записываем лог миграции
      await tx.guestMigration.create({
        data: {
          userId,
          guestId: guestData.guestId,
          favoritesCount: favoritesMigrated,
          historyCount: historyMigrated,
        },
      });

      return { favoritesMigrated, historyMigrated };
    });

    revalidatePath('/cabinet');

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('[Sync Guest Data Error]', error);
    return {
      success: false,
      error: 'Ошибка при синхронизации данных',
    };
  }
}

// ============================================
// Get User Data
// ============================================

export async function getUserFavorites() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const favorites = await db.favoriteOffer.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return favorites;
}

export async function getUserSearchHistory() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const history = await db.searchHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return history;
}

// ============================================
// Favorites Management
// ============================================

export async function toggleFavorite(
  offerId: string,
  offerExternalId?: string
): Promise<ActionResult<{ isFavorite: boolean }>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Не авторизован',
      };
    }

    const userId = session.user.id;

    // Проверяем, есть ли уже в избранном
    const existing = await db.favoriteOffer.findUnique({
      where: {
        userId_offerId: {
          userId,
          offerId,
        },
      },
    });

    if (existing) {
      // Удаляем
      await db.favoriteOffer.delete({
        where: { id: existing.id },
      });

      return {
        success: true,
        data: { isFavorite: false },
      };
    } else {
      // Добавляем
      await db.favoriteOffer.create({
        data: {
          userId,
          offerId,
          offerExternalId,
        },
      });

      return {
        success: true,
        data: { isFavorite: true },
      };
    }
  } catch (error) {
    console.error('[Toggle Favorite Error]', error);
    return {
      success: false,
      error: 'Ошибка при обновлении избранного',
    };
  }
}

export async function removeFavorite(offerId: string): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Не авторизован',
      };
    }

    await db.favoriteOffer.deleteMany({
      where: {
        userId: session.user.id,
        offerId,
      },
    });

    revalidatePath('/cabinet');

    return { success: true };
  } catch (error) {
    console.error('[Remove Favorite Error]', error);
    return {
      success: false,
      error: 'Ошибка при удалении из избранного',
    };
  }
}
