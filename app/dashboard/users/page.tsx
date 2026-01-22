import type { Metadata } from "next";
import { getTenantUsers } from '@/lib/data';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import UsersTable from '@/app/ui/users/table';

export const metadata: Metadata = {
    title: "Usuários",
    description: "Gerencie os usuários da sua organização",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function UsersPage() {
    const users = await getTenantUsers();

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
                <Link
                    href="/dashboard/users/create"
                    className="flex items-center gap-2 rounded-lg bg-[#6d7749] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5d6541]"
                >
                    <UserPlus className="h-5 w-5" />
                    Novo Usuário
                </Link>
            </div>

            <UsersTable users={users} />
        </div>
    );
}
