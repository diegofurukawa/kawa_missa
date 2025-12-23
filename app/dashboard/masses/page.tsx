import { getUpcomingMasses, getUserTenant } from '@/lib/data'; // We might need getAllMasses for admin
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';
import { deleteMass } from '@/lib/actions';
import { Button } from '@/app/ui/button';

type Mass = Awaited<ReturnType<typeof prisma.mass.findMany>>[0];

export default async function MassesPage() {
    const tenant = await getUserTenant();

    if (!tenant) {
        return (
            <div>
                <p>Por favor, configure sua organização primeiro.</p>
                <Link href="/dashboard/organization" className="text-blue-500 underline">Ir para Organização</Link>
            </div>
        )
    }

    // Fetch all masses for management (not just upcoming)
    const masses = await prisma.mass.findMany({
        where: { tenantId: tenant.id },
        orderBy: { date: 'desc' },
        take: 50
    });

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Masses</h1>
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
                            <th scope="col" className="px-6 py-4 font-semibold text-gray-700">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {masses.map((mass: Mass) => (
                            <tr key={mass.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                                    {format(mass.date, 'dd/MM/yyyy HH:mm')}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-gray-600 font-mono text-xs">{mass.slug}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <form action={async () => {
                                        'use server';
                                        await deleteMass(mass.id);
                                    }}>
                                        <button className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors">
                                            Excluir
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        {masses.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center py-8 text-gray-500">
                                    Nenhuma missa agendada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
