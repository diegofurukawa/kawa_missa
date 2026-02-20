import type { Metadata } from "next";
import { getUserTenant, getMassDistinctWeekdays, getMassDistinctTimes } from '@/lib/data';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatLocalDateTime, formatDateToBR } from '@/lib/date-utils';
import { Button } from '@/app/ui/button';
import Pagination from '@/app/ui/pagination';
import { Suspense } from 'react';
import { DeleteMassButton } from '@/app/ui/masses/delete-button';
import { MassFilter } from '@/app/ui/masses/mass-filter';

export const metadata: Metadata = {
    title: "Gerenciar Missas",
    description: "Gerencie todas as missas agendadas da sua paróquia",
    robots: {
        index: false,
        follow: false,
    },
};

interface MassesPageProps {
    searchParams: Promise<{ page?: string; weekday?: string; time?: string }>;
}

export default async function MassesPage({ searchParams }: MassesPageProps) {
    const tenant = await getUserTenant();

    if (!tenant) {
        return (
            <div>
                <p>Por favor, configure sua organização primeiro.</p>
                <Link href="/dashboard/organization" className="text-blue-500 underline">Ir para Organização</Link>
            </div>
        )
    }

    // Get page from search params
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
    const weekdayFilter = resolvedSearchParams.weekday ? parseInt(resolvedSearchParams.weekday, 10) : undefined;
    const timeFilter = resolvedSearchParams.time;
    const itemsPerPage = 10;
    const skip = (currentPage - 1) * itemsPerPage;

    // Fetch distinct values for filters
    const distinctWeekdays = await getMassDistinctWeekdays(tenant.id);
    const distinctTimes = await getMassDistinctTimes(tenant.id);

    // Fetch total count and masses with filters
    let totalCount: number;
    let masses: Array<Record<string, unknown>>;

    if (weekdayFilter !== undefined || timeFilter) {
        // Use raw query when filters are applied
        let countQuery = `SELECT COUNT(*) as count FROM "Mass" WHERE "tenantId" = $1`;
        let dataQuery = `SELECT * FROM "Mass" WHERE "tenantId" = $1`;
        const params: (string | number)[] = [tenant.id];
        let paramIndex = 2;

        if (weekdayFilter !== undefined) {
            countQuery += ` AND EXTRACT(DOW FROM ("date" - INTERVAL '3 hours')) = $${paramIndex}`;
            dataQuery += ` AND EXTRACT(DOW FROM ("date" - INTERVAL '3 hours')) = $${paramIndex}`;
            params.push(weekdayFilter);
            paramIndex++;
        }

        if (timeFilter) {
            countQuery += ` AND TO_CHAR("date" - INTERVAL '3 hours', 'HH24:MI') = $${paramIndex}`;
            dataQuery += ` AND TO_CHAR("date" - INTERVAL '3 hours', 'HH24:MI') = $${paramIndex}`;
            params.push(timeFilter);
            paramIndex++;
        }

        dataQuery += ` ORDER BY "date" ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(itemsPerPage, skip);

        const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
            countQuery,
            ...params.slice(0, -2)
        );
        totalCount = Number(countResult[0]?.count || 0);

        masses = await prisma.$queryRawUnsafe(dataQuery, ...params);
    } else {
        // Standard query without filters
        totalCount = await prisma.mass.count({
            where: { tenantId: tenant.id }
        });

        masses = await prisma.mass.findMany({
            where: { tenantId: tenant.id },
            include: {
                config: {
                    select: {
                        id: true,
                        cronConfig: true
                    }
                }
            },
            orderBy: { date: 'asc' },
            skip,
            take: itemsPerPage
        });
    }

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Helper function to count participants
    const countParticipants = (participants: unknown): number => {
        if (typeof participants !== 'object' || participants === null) return 0;
        const participantsObj = participants as Record<string, unknown>;
        return Object.values(participantsObj).reduce((total: number, roleParticipants) => {
            if (Array.isArray(roleParticipants)) {
                return total + roleParticipants.length;
            }
            return total;
        }, 0);
    };

    // Helper function to get config display
    const getConfigDisplay = (config: { cronConfig: unknown } | null): string => {
        if (!config) return '-';
        const cronConfig = config.cronConfig as { frequency?: string[] };
        const frequencies = cronConfig?.frequency || [];
        return frequencies.length > 0 ? frequencies[0] : '-';
    };

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Missas</h1>
                    <p className="text-sm text-gray-500 mt-1">Gerencie todas as missas agendadas</p>
                </div>
                <Link href="/dashboard/masses/create">
                    <Button variant="primary">
                        <span className="md:block">+ Criar Missa</span>
                    </Button>
                </Link>
            </div>

            <MassFilter
                weekdays={distinctWeekdays}
                times={distinctTimes}
                currentWeekday={resolvedSearchParams.weekday}
                currentTime={resolvedSearchParams.time}
            />

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Desktop Table */}
                <table className="hidden md:table min-w-full text-left text-sm font-light">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Data</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Slug</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Participantes</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Configuração</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {masses.map((mass: Record<string, unknown>) => {
                            const participantCount = countParticipants(mass.participants);
                            const configDisplay = getConfigDisplay(mass.config as { cronConfig: unknown } | null);
                            // Use formatLocalDateTime to preserve local time
                            const { date, time } = formatLocalDateTime(mass.date as Date);
                            const formattedDate = formatDateToBR(date);

                            return (
                                <tr key={mass.id as string} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                                        {formattedDate} {time}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-600 font-mono text-xs">{mass.slug as string}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-700">
                                        {participantCount}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-600 font-mono text-xs">
                                        {configDisplay}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={`/dashboard/masses/${mass.id as string}/edit`}
                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                                            >
                                                Editar
                                            </Link>
                                            <DeleteMassButton massId={mass.id as string} massLabel={`${formattedDate} às ${time}`} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {masses.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">
                                    Nenhuma missa agendada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3 p-4">
                    {masses.map((mass: Record<string, unknown>) => {
                        const participantCount = countParticipants(mass.participants);
                        const configDisplay = getConfigDisplay(mass.config as { cronConfig: unknown } | null);
                        const { date, time } = formatLocalDateTime(mass.date as Date);
                        const formattedDate = formatDateToBR(date);

                        return (
                            <Link
                                key={mass.id as string}
                                href={`/dashboard/masses/${mass.id as string}/edit`}
                                className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-[#6d7749] transition-all"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900 text-sm">
                                            {formattedDate} às {time}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Slug: <span className="font-mono">{mass.slug as string}</span>
                                        </div>
                                        <div className="text-xs text-gray-600 mt-2">
                                            {participantCount} participante{participantCount !== 1 ? 's' : ''}
                                            {configDisplay !== '-' && ` • Config: ${configDisplay}`}
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <DeleteMassButton massId={mass.id as string} massLabel={`${formattedDate} às ${time}`} />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                    {masses.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Nenhuma missa agendada.
                        </div>
                    )}
                </div>
            </div>

            {totalPages > 1 && (
                <div className="mt-6">
                    <Suspense fallback={<div className="text-center text-gray-500">Carregando...</div>}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            basePath="/dashboard/masses"
                        />
                    </Suspense>
                </div>
            )}
        </div>
    );
}
