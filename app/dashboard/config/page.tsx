import { getUserTenant, getConfigs } from '@/lib/data';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { deleteConfig } from '@/lib/actions';
import { format } from 'date-fns';

type Config = Awaited<ReturnType<typeof getConfigs>>[0];

interface CronConfig {
    frequency?: string[];
}

interface ParticipantConfig {
    roles?: [string, number][];
}

type RoleEntry = [string, number] | string;

export default async function ConfigPage() {
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

    const configs = await getConfigs(tenant.id);

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

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                            
                            // Handle createdAt - may not exist in old records
                            const createdAt = config.createdAt || new Date();

                            return (
                                <tr key={config.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 font-mono text-xs">
                                        {cronExpr}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 text-sm">
                                        {rolesDisplay}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {format(new Date(createdAt), 'dd/MM/yyyy HH:mm')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <form action={async () => {
                                            'use server';
                                            await deleteConfig(config.id);
                                        }}>
                                            <button className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors">
                                                Excluir
                                            </button>
                                        </form>
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
        </div>
    );
}
