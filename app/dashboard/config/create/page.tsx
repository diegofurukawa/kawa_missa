import { getUserTenant } from '@/lib/data';
import ConfigForm from '@/app/ui/config/form';
import Link from 'next/link';

export default async function CreateConfigPage() {
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

    return (
        <div className="w-full">
            <div className="mb-6">
                <Link href="/dashboard/config" className="text-blue-500 hover:underline">
                    &larr; Voltar para Configurações
                </Link>
            </div>
            <ConfigForm />
        </div>
    );
}

