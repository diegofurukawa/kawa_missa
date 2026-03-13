import type { Metadata } from 'next';
import { getUserTenant, getMassesForReports } from '@/lib/data';
import { buildMassReportSummary } from '@/lib/report-utils';
import ReportsWorkspace from '@/app/ui/reports/reports-workspace';

export const metadata: Metadata = {
    title: 'Relatorios',
    description: 'Visualize, selecione e exporte relatorios das missas cadastradas',
    robots: {
        index: false,
        follow: false,
    },
};

interface ReportsPageProps {
    searchParams: Promise<{ from?: string; to?: string }>;
}

function getCurrentMonthRange(): { from: string; to: string } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const pad = (n: number) => String(n).padStart(2, '0');
    const firstDay = `${year}-${pad(month + 1)}-01`;
    const lastDayDate = new Date(year, month + 1, 0);
    const lastDay = `${year}-${pad(month + 1)}-${pad(lastDayDate.getDate())}`;
    return { from: firstDay, to: lastDay };
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
    const tenant = await getUserTenant();

    if (!tenant) {
        return (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                Organizacao nao encontrada. Configure sua organizacao para gerar relatorios.
            </div>
        );
    }

    const resolvedSearchParams = await searchParams;
    const hasExplicitFilter = resolvedSearchParams.from !== undefined || resolvedSearchParams.to !== undefined;
    const defaultRange = getCurrentMonthRange();

    const from = resolvedSearchParams.from?.trim() || defaultRange.from;
    const to = resolvedSearchParams.to?.trim() || defaultRange.to;

    const { masses, truncated } = await getMassesForReports(tenant.id, { from, to });

    const reports = masses.map((mass) => buildMassReportSummary({
        id: mass.id,
        slug: mass.slug,
        date: mass.date,
        type: mass.type,
        description: mass.description,
        participants: mass.participants,
        participantConfig: mass.config?.participantConfig as { roles?: [string, number][] } | undefined,
    }));

    return (
        <ReportsWorkspace
            masses={reports}
            from={from}
            to={to}
            hasExplicitFilter={hasExplicitFilter}
            truncated={truncated}
        />
    );
}
