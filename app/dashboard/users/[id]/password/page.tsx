import type { Metadata } from "next";
import { getUserById } from '@/lib/data';
import ChangePasswordForm from '@/app/ui/users/change-password-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
    title: "Alterar Senha",
    description: "Alterar senha do usuário",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function ChangePasswordPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getUserById(id);

    if (!user) {
        notFound();
    }

    return (
        <div className="w-full">
            <Link
                href="/dashboard/users"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Usuários
            </Link>

            <ChangePasswordForm user={user} />
        </div>
    );
}
