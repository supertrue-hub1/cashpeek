# Auth.js Гибридная Регистрация

## Установка

### 1. Установите зависимости

```bash
npm install bcrypt @auth/prisma-adapter
npm install -D @types/bcrypt
```

### 2. Примените миграции Prisma

```bash
npm run db:push
```

### 3. Настройте переменные окружения

Скопируйте `.env.example` в `.env` и замените `AUTH_SECRET` на случайную строку:

```bash
openssl rand -base64 32
```

### 4. Создайте первого администратора

```bash
npx prisma studio
```

Создайте пользователя в таблице `User`:
- email: admin@example.com
- password: (хешированный пароль)
- role: admin

## Архитектура

### Схема БД

```
User
├── Account[] (OAuth аккаунты)
├── Session[] (сессии)
├── FavoriteOffer[] (избранные офферы)
├── SearchHistory[] (история поиска)
└── GuestMigration (лог миграции гостя)
```

### Middleware

Защищает маршруты:
- `/cabinet/*` - требуется авторизация
- `/api/favorites/*` - требуется авторизация
- `/admin/*` - требуется роль admin

Гостевые маршруты (редирект если авторизован):
- `/login`
- `/register`

### Поток синхронизации Guest -> User

```
1. Гость добавляет офферы в избранное → LocalStorage
2. Гость нажимает "Войти/Регистрация"
3. После успешного входа → syncGuestData()
4. Данные из LocalStorage переносятся в БД
5. LocalStorage очищается
6. GuestMigration создаётся для предотвращения дублей
```

## Использование

### FavoriteButton

```tsx
import { FavoriteButton } from '@/components/auth/favorite-button';
import { auth } from '@/lib/auth';

// В Server Component
const session = await auth();

// В JSX
<FavoriteButton
  offerId={offer.id}
  offerExternalId={offer.externalId}
  isAuthenticated={!!session}
  showText
/>
```

### Защита Server Action

```tsx
'use server';

import { auth } from '@/lib/auth';

export async function myProtectedAction() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: 'Не авторизован' };
  }
  
  // Логика...
}
```

### Получение текущего пользователя

```tsx
import { getCurrentUser } from '@/lib/auth';

const user = await getCurrentUser();
```

## API Endpoints

- `POST /api/auth/signin` - вход
- `POST /api/auth/signout` - выход
- `GET /api/auth/session` - текущая сессия

## Страницы

- `/login` - вход
- `/register` - регистрация
- `/cabinet` - личный кабинет
- `/cabinet/favorites` - избранные офферы
- `/cabinet/history` - история поиска
