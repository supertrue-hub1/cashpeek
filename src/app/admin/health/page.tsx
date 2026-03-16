import { Metadata } from 'next';
import { HealthCheckDashboard } from '@/components/admin/health-check-dashboard';

export const metadata: Metadata = {
  title: 'Health Check - Админ-панель',
  description: 'Мониторинг здоровья сайта МФО агрегатора'
};

export default function HealthCheckPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Check</h1>
          <p className="text-muted-foreground">
            Мониторинг здоровья сайта и API endpoints
          </p>
        </div>
      </div>

      <HealthCheckDashboard />
    </div>
  );
}
