import type { Metadata } from "next";
import { getAllTenants } from '@/lib/data';
import TenantList from '@/app/ui/select-tenant/tenant-list';
import Image from 'next/image';

export const metadata: Metadata = {
  title: "Selecione uma Organização",
  description: "Escolha a paróquia ou organização para visualizar as missas",
};

interface SelectTenantProps {
    searchParams: Promise<{ redirect?: string }>;
}

export default async function SelectTenant({ searchParams }: SelectTenantProps) {
    const params = await searchParams;
    const tenants = await getAllTenants();
    const redirectUrl = params.redirect || '/dashboard/public';

    return (
        <div className="min-h-screen bg-[#f6f5f8] flex flex-col">
            {/* Header simples */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                        <Image
                            src="/logo.jpeg"
                            alt="Logo"
                            width={48}
                            height={48}
                            className="rounded-full"
                        />
                        <h1 className="text-2xl font-bold text-gray-900">Kawa Missa</h1>
                    </div>
                </div>
            </header>

            {/* Conteúdo principal */}
            <main className="flex-1 py-12 px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            Selecione uma Organização
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Escolha a paróquia ou organização para visualizar as próximas missas
                        </p>
                    </div>

                    <TenantList tenants={tenants} redirectUrl={redirectUrl} />
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-4">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <p className="text-center text-sm text-gray-600">
                        © 2025 Paróquia de Todos Desenvolvido por FurukawaTech
                    </p>
                </div>
            </footer>
        </div>
    );
}
