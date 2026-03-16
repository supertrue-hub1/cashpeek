-- SQL скрипт для инициализации Health Check
-- Запуск через: psql -d adminmfo -f scripts/init-health-check.sql

-- Добавление страниц для мониторинга
INSERT INTO "HealthCheckPage" (id, url, name, category, priority, "checkInterval", timeout, "expectedStatus", "maxResponseTime", "isActive", "notifyOnError", "notifyOnWarning", "lastStatus", "totalChecks", "healthyChecks", "uptime24h", "uptime7d", "uptime30d", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), '/', 'Главная страница', 'main', 1, 300, 30000, 200, 1000, true, true, true, 'unknown', 0, 0, 0, 0, 0, NOW(), NOW()),
  (gen_random_uuid(), '/mfo', 'Каталог МФО', 'main', 1, 300, 30000, 200, 1500, true, true, true, 'unknown', 0, 0, 0, 0, 0, NOW(), NOW()),
  (gen_random_uuid(), '/about', 'О компании', 'main', 3, 600, 30000, 200, 1000, true, true, true, 'unknown', 0, 0, 0, 0, 0, NOW(), NOW()),
  (gen_random_uuid(), '/contacts', 'Контакты', 'main', 3, 600, 30000, 200, 1000, true, true, true, 'unknown', 0, 0, 0, 0, 0, NOW(), NOW()),
  (gen_random_uuid(), '/api/v1/mfo', 'API: Список МФО', 'api', 1, 60, 30000, 200, 500, true, true, true, 'unknown', 0, 0, 0, 0, 0, NOW(), NOW()),
  (gen_random_uuid(), '/api/health', 'API: Health Check', 'api', 2, 120, 30000, 200, 200, true, true, true, 'unknown', 0, 0, 0, 0, 0, NOW(), NOW()),
  (gen_random_uuid(), '/css/main.css', 'CSS: Главные стили', 'static', 4, 600, 30000, 200, 500, true, true, true, 'unknown', 0, 0, 0, 0, 0, NOW(), NOW())
ON CONFLICT (url) DO NOTHING;

-- Проверка результата
SELECT 
  url, 
  name, 
  category, 
  priority,
  "isActive"
FROM "HealthCheckPage"
ORDER BY priority, name;
