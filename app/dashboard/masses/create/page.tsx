import { getUserTenant, getAllConfigs } from '@/lib/data';
import CreateMassForm from '@/app/ui/masses/create-form';
import Link from 'next/link';

export default async function CreateMassPage() {
    const tenant = await getUserTenant();

    if (!tenant) {
        return <p>Organização não encontrada. Por favor, configure uma organização.</p>;
    }

    const configs = await getAllConfigs(tenant.id);

    return (
        <div className="w-full">
            <div className="mb-6">
                <Link href="/dashboard/masses" className="text-blue-500 hover:underline">
                    &larr; Voltar para Missas
                </Link>
            </div>
            <CreateMassForm tenant={tenant} configs={configs} />
        </div>
    );
}
