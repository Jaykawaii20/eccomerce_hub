// This file intentionally left as redirect — the root / route is handled by (storefront) group
import { redirect } from 'next/navigation';

export default function RootDashboardPage() {
  redirect('/dashboard');
}
