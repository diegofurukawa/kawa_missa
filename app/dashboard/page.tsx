import type { Metadata } from "next";
import { getUpcomingMassesFiltered, getUserTenant, getLatestConfig, getMassDistinctWeekdays, getMassDistinctTimes } from '@/lib/data';
import MassCarousel from '@/app/ui/dashboard/mass-carousel';
import CatholicMessageBanner from '@/app/ui/dashboard/catholic-message-banner';
import ShareButton from '@/app/ui/share-button';
import { MassFilter } from '@/app/ui/masses/mass-filter';
import { generateShareUrl } from '@/app/ui/share-url-generator';
import { auth } from '@/auth';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Painel de controle - Gerencie missas e visualize próximos eventos",
    robots: {
        index: false,
        follow: false,
    },
};

interface DashboardProps {
    searchParams: Promise<{ weekday?: string; time?: string }>;
}

export default async function Dashboard({ searchParams }: DashboardProps) {
    const session = await auth();
    const isLoggedIn = !!session?.user;

    const resolvedSearchParams = await searchParams;
    const parsedWeekday = parseInt(resolvedSearchParams.weekday ?? '', 10);
    const weekdayFilter = !isNaN(parsedWeekday) && parsedWeekday >= 0 && parsedWeekday <= 6 ? parsedWeekday : undefined;
    const timeFilter = /^\d{2}:\d{2}$/.test(resolvedSearchParams.time ?? '') ? resolvedSearchParams.time : undefined;

    const tenant = await getUserTenant();

    const [masses, config, distinctWeekdays, distinctTimes, publicDashboardUrl] = await Promise.all([
        tenant ? getUpcomingMassesFiltered(tenant.id, { weekday: weekdayFilter, time: timeFilter }) : Promise.resolve([]),
        tenant ? getLatestConfig(tenant.id) : Promise.resolve(null),
        tenant ? getMassDistinctWeekdays(tenant.id) : Promise.resolve([]),
        tenant ? getMassDistinctTimes(tenant.id) : Promise.resolve([]),
        tenant ? generateShareUrl({ type: 'dashboard', tenantId: tenant.id }) : Promise.resolve(null),
    ]);

    return (
        <div className="w-full space-y-6">

            {/* Welcome Section - Only show for logged-in users */}
            {isLoggedIn && (
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {tenant?.denomination || tenant?.name || 'Bem-vindo!'}
                        </h1>
                        {tenant?.responsibleName && (
                            <p className="text-gray-600 mt-1.5">
                                Gestão: {tenant.responsibleName}
                            </p>
                        )}
                    </div>
                    {tenant && publicDashboardUrl && (
                        <ShareButton
                            url={publicDashboardUrl}
                            title={`${tenant.denomination || tenant.name} - Próximas Missas`}
                            text="Confira as próximas missas"
                            iconOnly={true}
                        />
                    )}
                </div>
            )}

            {/* Filters */}
            {isLoggedIn && tenant && (
                <Suspense fallback={null}>
                    <MassFilter
                        weekdays={distinctWeekdays}
                        times={distinctTimes}
                        currentWeekday={resolvedSearchParams.weekday}
                        currentTime={resolvedSearchParams.time}
                        basePath="/dashboard"
                    />
                </Suspense>
            )}

            {/* Carousel Section */}
            {tenant && (
                <section>
                    {isLoggedIn && (
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Próximas Missas e Encontros</h2>
                    )}
                    <MassCarousel masses={masses.map(m => ({ ...m, participants: (m.participants ?? {}) as Record<string, string[]> }))} isLoggedIn={isLoggedIn} config={config ?? undefined} currentPage={1} currentWeekday={resolvedSearchParams.weekday} currentTime={resolvedSearchParams.time} />
                </section>
            )}

            {/* Catholic Message Banner */}
            <section>
                <CatholicMessageBanner />
            </section>
        </div>
    );
}
