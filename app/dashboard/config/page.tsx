import type { Metadata } from "next";
import { getUserTenant, getConfigs } from '@/lib/data';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { formatLocalDateTime, formatDateToBR } from '@/lib/date-utils';
import Pagination from '@/app/ui/pagination';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import { DeleteConfigButton } from '@/app/ui/config/delete-button';
import { CopyConfigButton } from '@/app/ui/config/copy-button';

export const metadata: Metadata = {
    title: "Configurações",
    description: "Configure cronogramas e participantes das missas",
    robots: {
        index: false,
        follow: false,
    },
};

type Config = Awaited<ReturnType<typeof getConfigs>>[0];

interface CronConfig {
    frequency?: string[];
}

interface ParticipantConfig {
    roles?: [string, number][];
}

type RoleEntry = [string, number] | string;

interface ConfigPageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function ConfigPage({ searchParams }: ConfigPageProps) {
    const tenant = await getUserTenant();

    if (!tenant) {
        return (
            <div className="w-full">
                <div className="bg-yellow-100 p-4 rounded mb-4 text-yellow-800">
                    Por favor, configure sua organização primeiro.
                </div>
            </div>
        );
    }

    // Get page from search params
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
    const itemsPerPage = 10;
    const skip = (currentPage - 1) * itemsPerPage;

    // Fetch total count for pagination
    const totalCount = await prisma.config.count({
        where: { tenantId: tenant.id }
    });

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Fetch configs with pagination
    const configs = await prisma.config.findMany({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: itemsPerPage
    });

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
                    <p className="text-sm text-gray-500 mt-1">Gerencie todas as configurações de cron e participantes</p>
                </div>
                <Link href="/dashboard/config/create">
                    <Button variant="primary">
                        <span className="md:block">+ Criar Configuração</span>
                    </Button>
                </Link>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-4">
                {configs.map((config: Config) => {
                    const cronConfig = config.cronConfig as unknown as CronConfig;
                    const cronFreq = cronConfig?.frequency || [];
                    const cronExpr = Array.isArray(cronFreq) && cronFreq.length > 0 ? cronFreq[0] : '-';

                    const participantConfig = config.participantConfig as unknown as ParticipantConfig;
                    const roles = participantConfig?.roles || [];
                    const rolesDisplay = Array.isArray(roles)
                        ? roles.map((r: RoleEntry) => Array.isArray(r) ? `${r[0]} (${r[1]})` : r).join(', ')
                        : '-';

                    const createdAt = config.createdAt || new Date();
                    const { date, time } = formatLocalDateTime(createdAt);
                    const formattedDate = formatDateToBR(date);

                    return (
                        <div key={config.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Expressão Cron</p>
                                    <p className="text-sm font-mono text-gray-900 break-all">{cronExpr}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Roles</p>
                                    <p className="text-sm text-gray-700">{rolesDisplay}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Criado em</p>
                                    <p className="text-sm text-gray-600">{formattedDate} {time}</p>
                                </div>

                                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                                    <Link
                                        href={`/dashboard/config/${config.id}/edit`}
                                        className="flex-1 text-center py-2 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium text-sm transition-colors"
                                    >
                                        Editar
                                    </Link>
                                    <div className="flex-1">
                                        <CopyConfigButton configId={config.id} />
                                    </div>
                                    <DeleteConfigButton configId={config.id} />
                                </div>
                            </div>
                        </div>
                    );
                })}
                {configs.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                        Nenhuma configuração cadastrada.
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full text-left text-sm font-light">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Expressão Cron</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Roles</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Criado em</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {configs.map((config: Config) => {
                            const cronConfig = config.cronConfig as unknown as CronConfig;
                            const cronFreq = cronConfig?.frequency || [];
                            const cronExpr = Array.isArray(cronFreq) && cronFreq.length > 0 ? cronFreq[0] : '-';

                            const participantConfig = config.participantConfig as unknown as ParticipantConfig;
                            const roles = participantConfig?.roles || [];
                            const rolesDisplay = Array.isArray(roles)
                                ? roles.map((r: RoleEntry) => Array.isArray(r) ? `${r[0]} (${r[1]})` : r).join(', ')
                                : '-';

                            const createdAt = config.createdAt || new Date();
                            const { date, time } = formatLocalDateTime(createdAt);
                            const formattedDate = formatDateToBR(date);

                            return (
                                <tr key={config.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 font-mono text-xs">
                                        {cronExpr}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 text-sm">
                                        {rolesDisplay}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {formattedDate} {time}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={`/dashboard/config/${config.id}/edit`}
                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                                            >
                                                Editar
                                            </Link>
                                            <CopyConfigButton configId={config.id} />
                                            <DeleteConfigButton configId={config.id} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {configs.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500">
                                    Nenhuma configuração cadastrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-6">
                    <Suspense fallback={<div className="text-center text-gray-500">Carregando...</div>}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            basePath="/dashboard/config"
                        />
                    </Suspense>
                </div>
            )}
        </div>
    );
}
