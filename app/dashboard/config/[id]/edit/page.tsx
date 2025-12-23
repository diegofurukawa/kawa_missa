import { getUserTenant, getConfigById } from '@/lib/data';
import ConfigForm from '@/app/ui/config/form';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditConfigPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
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

    const config = await getConfigById(id);

    if (!config) {
        notFound();
    }

    // Verify the config belongs to the user's tenant
    if (config.tenantId !== tenant.id) {
        return (
            <div className="w-full">
                <div className="bg-red-100 p-4 rounded mb-4 text-red-800">
                    Você não tem permissão para editar esta configuração.
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-6">
                <Link href="/dashboard/config" className="text-blue-500 hover:underline">
                    &larr; Voltar para Configurações
                </Link>
            </div>
            <ConfigForm config={config} />
        </div>
    );
}

