import { Metadata } from 'next';
import { LinkCheckerPanel } from '@/components/admin/link-checker-panel';

export const metadata: Metadata = {
  title: 'Битые ссылки | Админ-панель',
  description: 'Управление битыми ссылками офферов',
};

export default function BrokenLinksPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Битые ссылки</h1>
        <p className="text-muted-foreground">
          Мониторинг и управление состоянием внешних ссылок офферов
        </p>
      </div>
      
      <LinkCheckerPanel />
    </div>
  );
}
