import { getUserTenant } from '@/lib/data';
import OrganizationForm from '@/app/ui/organization/form';

export default async function OrganizationPage() {
    const tenant = await getUserTenant();

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Configuração da Organização</h1>
            </div>

            {!tenant && (
                <div className="bg-yellow-100 p-4 rounded mb-4 text-yellow-800">
                    Por favor, configure sua organização para começar a gerenciar missas.
                </div>
            )}

            <OrganizationForm tenant={tenant} />
        </div>
    );
}
