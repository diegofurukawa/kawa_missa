import { auth } from '@/auth';
import { redirect } from 'next/navigation';

interface HomeProps {
  searchParams: Promise<{ tenant?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const session = await auth();
  const params = await searchParams;
  const tenantId = params.tenant;

  // Se logado, vai para dashboard privado
  if (session?.user) {
    redirect('/dashboard');
  }

  // Se não tem tenant, vai para seleção
  if (!tenantId) {
    redirect('/select-tenant?redirect=/dashboard/public');
  }

  // Se tem tenant, vai para dashboard público
  redirect(`/dashboard/public?tenant=${tenantId}`);
}
