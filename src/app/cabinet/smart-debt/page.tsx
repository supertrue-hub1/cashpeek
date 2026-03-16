/**
 * Редирект на вкладку "Умный долг" в кабинете
 */

import { redirect } from 'next/navigation';

export default function SmartDebtPage() {
  redirect('/cabinet?tab=smart-debt');
}
