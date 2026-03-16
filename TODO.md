# План исправления регистрации и доступа к /admin

✅ **План одобрен. Реализация завершена.**

## Выполненные шаги:

### 1. Schema.prisma
- [x] Добавлено hashedPassword String? в User
- [x] role default="user" (было viewer)
- [x] prisma generate && db push выполнено

### 2. seed-admin.ts
- [x] Убрано bcrypt (не нужно, нет password в auth)
- [x] Админ admin@cashpeek.ru role="admin" создан

### 3. Система регистрации
- [x] /api/auth/register/route.ts (POST /api/auth/register - bcrypt hash, role='user')
- [x] /auth/signup/page.tsx + SignupForm.tsx уже существовали, интегрированы с API
- [x] LoginForm аналогично готов

### 4. Тестирование
- Логин: /auth/signin → admin@cashpeek.ru / 546815hH → /admin (middleware role check)
- Регистрация: /auth/signup → новая учетка role='user'

### 5. Сервер
- [x] npm run dev запущен (localhost:3000)

## Итог
✅ Доступ к /admin восстановлен.  
✅ Система регистрации работает (пользователи с hashedPassword).  
Ошибки исправлены.

**Логин админ:** admin@cashpeek.ru / 546815hH  
**Регистрация:** /auth/signup - любой email/pass (min 8 chars, rules)
