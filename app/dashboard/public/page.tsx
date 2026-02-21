import type { Metadata } from "next";
import { getTenantBySlug, getUpcomingMassesFiltered, getLatestConfig, getMassDistinctWeekdays, getMassDistinctTimes } from '@/lib/data';
import MassCarousel from '@/app/ui/dashboard/mass-carousel';
import CatholicMessageBanner from '@/app/ui/dashboard/catholic-message-banner';
import ShareButton from '@/app/ui/share-button';
import { MassFilter } from '@/app/ui/masses/mass-filter';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Suspense } from 'react';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const tenantSlug = resolvedSearchParams.tenant;

  if (!tenantSlug) {
    return {
      title: "Consulta de Missas",
      description: "Plataforma para consulta de horários de missas",
    };
  }

  try {
    const tenant = await getTenantBySlug(tenantSlug);

    if (!tenant) {
      return {
        title: "Paróquia não encontrada",
        description: "A paróquia solicitada não foi encontrada",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = `${tenant.denomination || tenant.name} - Próximas Missas`;
    const description = tenant.responsibleName
      ? `Consulte os horários das próximas missas - ${tenant.responsibleName}`
      : `Consulte os horários das próximas missas de ${tenant.denomination || tenant.name}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        locale: "pt_BR",
        url: `/dashboard/public?tenant=${tenantSlug}`,
        siteName: "Kawa Missa",
        images: [
          {
            url: "/og-image-public.png",
            width: 1200,
            height: 630,
            alt: tenant.denomination || tenant.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ["/og-image-public.png"],
      },
      alternates: {
        canonical: `/dashboard/public?tenant=${tenantSlug}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Erro ao carregar paróquia",
      description: "Plataforma para consulta de horários de missas",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function PublicDashboardPage({ searchParams }: { searchParams: Promise<{ tenant?: string; page?: string; weekday?: string; time?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const tenantSlug = resolvedSearchParams.tenant;
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const parsedWeekday = parseInt(resolvedSearchParams.weekday ?? '', 10);
  const weekdayFilter = !isNaN(parsedWeekday) && parsedWeekday >= 0 && parsedWeekday <= 6 ? parsedWeekday : undefined;
  const timeFilter = /^\d{2}:\d{2}$/.test(resolvedSearchParams.time ?? '') ? resolvedSearchParams.time : undefined;

  // Se não tem tenant, redireciona para seleção
  if (!tenantSlug) {
    redirect('/select-tenant?redirect=/dashboard/public');
  }

  const tenant = await getTenantBySlug(tenantSlug);

  // Se o tenant não existe, redireciona para seleção de paróquia
  if (!tenant) {
    redirect('/select-tenant?redirect=/dashboard/public');
  }

  const [masses, config, distinctWeekdays, distinctTimes] = await Promise.all([
    getUpcomingMassesFiltered(tenant.id, { weekday: weekdayFilter, time: timeFilter }),
    getLatestConfig(tenant.id),
    getMassDistinctWeekdays(tenant.id),
    getMassDistinctTimes(tenant.id),
  ]);

  // Build the public URL using headers
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const publicUrl = `${protocol}://${host}/dashboard/public?tenant=${tenantSlug}`;

  return (
    <div className="w-full space-y-6">
      {/* Parish Identity Bar */}
      <div className="flex items-center justify-between px-4 pt-4 md:px-0 md:pt-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {tenant.denomination || tenant.name}
          </h1>
          {tenant.responsibleName && (
            <p className="text-gray-600 text-sm mt-0.5">
              {tenant.responsibleName}
            </p>
          )}
        </div>
        <ShareButton
          url={publicUrl}
          title={`${tenant.denomination || tenant.name} - Próximas Missas`}
          text="Confira as próximas missas"
          iconOnly
        />
      </div>

      {/* Filters */}
      {/* Suspense is kept as defense-in-depth: useRouter (used inside MassFilter) may trigger
          async boundaries in future Next.js versions, even without useSearchParams */}
      <div className="px-4 md:px-0">
        <Suspense fallback={null}>
          <MassFilter
            weekdays={distinctWeekdays}
            times={distinctTimes}
            currentWeekday={resolvedSearchParams.weekday}
            currentTime={resolvedSearchParams.time}
            basePath={`/dashboard/public?tenant=${tenantSlug}`}
          />
        </Suspense>
      </div>

      {/* Carousel Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center px-4 md:px-0">Próximas Missas</h2>
        <MassCarousel masses={masses.map(m => ({ ...m, participants: (m.participants ?? {}) as Record<string, string[]> }))} isLoggedIn={false} config={config ?? undefined} tenantSlug={tenantSlug} currentPage={currentPage} currentWeekday={resolvedSearchParams.weekday} currentTime={resolvedSearchParams.time} />
      </section>

      {/* Catholic Message Banner */}
      <section className="px-4 md:px-0">
        <CatholicMessageBanner />
      </section>
    </div>
  );
}

