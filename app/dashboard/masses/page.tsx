import { getUserTenant } from '@/lib/data';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';
import { deleteMass } from '@/lib/actions';
import { Button } from '@/app/ui/button';
import Pagination from '@/app/ui/pagination';
import { Suspense } from 'react';

interface MassesPageProps {
    searchParams: Promise<{ page?: string }>;
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
    const itemsPerPage = 10;
    const skip = (currentPage - 1) * itemsPerPage;

    // Fetch total count for pagination
    const totalCount = await prisma.mass.count({
        where: { tenantId: tenant.id }
    });

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Fetch all masses for management (not just upcoming) with pagination
    const masses = await prisma.mass.findMany({
        where: { tenantId: tenant.id },
        include: {
            config: {
                select: {
                    id: true,
                    cronConfig: true
                }
            }
        },
        orderBy: { date: 'desc' },
        skip,
        take: itemsPerPage
    });

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

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full text-left text-sm font-light">
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
                        {masses.map((mass) => {
                            const participantCount = countParticipants(mass.participants);
                            const configDisplay = getConfigDisplay(mass.config);
                            
                            return (
                                <tr key={mass.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                                        {format(mass.date, 'dd/MM/yyyy HH:mm')}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-600 font-mono text-xs">{mass.slug}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-700">
                                        {participantCount}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-600 font-mono text-xs">
                                        {configDisplay}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Link 
                                                href={`/dashboard/masses/${mass.id}/edit`}
                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                                            >
                                                Editar
                                            </Link>
                                            <form action={async () => {
                                                'use server';
                                                await deleteMass(mass.id);
                                            }}>
                                                <button className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors">
                                                    Excluir
                                                </button>
                                            </form>
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
