import type { Metadata } from "next";
import { getAllTenants } from '@/lib/data';
import TenantList from '@/app/ui/select-tenant/tenant-list';
import Image from 'next/image';
import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';

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
            {/* Header com botões de ação */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo centralizado em mobile, à esquerda em desktop */}
                        <div className="flex items-center gap-3">
                            <Image
                                src="/logo.jpeg"
                                alt="Logo"
                                width={48}
                                height={48}
                                className="rounded-full"
                            />
                            <h1 className="text-2xl font-bold text-gray-900 hidden md:block">Kawa Missa</h1>
                        </div>

                        {/* Botões de ação */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="flex items-center gap-2 px-4 py-2 text-[#6d7749] hover:bg-[#6d7749]/5 rounded-lg transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                <span className="hidden sm:inline">Entrar</span>
                            </Link>
                            <Link
                                href="/onboarding"
                                className="flex items-center gap-2 px-4 py-2 bg-[#6d7749] text-white rounded-lg hover:bg-[#5d6541] transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span className="hidden sm:inline">Cadastrar Paróquia</span>
                            </Link>
                        </div>
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

            {/* Footer com links úteis */}
            <footer className="bg-white border-t border-gray-200 py-6">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-600">
                            © 2025 Paróquia de Todos • Desenvolvido por FurukawaTech
                        </p>

                        <div className="flex items-center gap-6 text-sm">
                            <Link
                                href="/login"
                                className="text-gray-600 hover:text-[#6d7749] transition-colors"
                            >
                                Já tem conta? <span className="font-medium">Entrar</span>
                            </Link>
                            <span className="text-gray-300">•</span>
                            <Link
                                href="/onboarding"
                                className="text-gray-600 hover:text-[#6d7749] transition-colors"
                            >
                                Não tem conta? <span className="font-medium">Cadastre-se</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
