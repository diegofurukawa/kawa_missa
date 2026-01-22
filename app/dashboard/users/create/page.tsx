import type { Metadata } from "next";
import CreateUserForm from '@/app/ui/users/create-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
    title: "Novo Usuário",
    description: "Criar novo usuário",
    robots: {
        index: false,
        follow: false,
    },
};

export default function CreateUserPage() {
    return (
        <div className="w-full">
            <Link
                href="/dashboard/users"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Usuários
            </Link>

            <CreateUserForm />
        </div>
    );
}
