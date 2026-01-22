'use client';

import { Edit, Trash2, Key } from 'lucide-react';
import Link from 'next/link';
import { deleteUser } from '@/lib/actions';
import { toast } from 'sonner';
import { format } from 'date-fns';

type User = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    createdAt: Date;
};

export default function UsersTable({ users }: { users: User[] }) {
    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir o usuário "${name}"?`)) {
            return;
        }

        const result = await deleteUser(id);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message || 'Erro ao excluir usuário');
        }
    };

    if (users.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Nenhum usuário encontrado.</p>
                <Link
                    href="/dashboard/users/create"
                    className="inline-block mt-4 text-[#6d7749] hover:underline"
                >
                    Criar primeiro usuário
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nome
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Telefone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Função
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Criado em
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{user.phone || '-'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/dashboard/users/${user.id}/edit`}
                                            className="text-[#6d7749] hover:text-[#5d6541] p-1"
                                            title="Editar usuário"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                        <Link
                                            href={`/dashboard/users/${user.id}/password`}
                                            className="text-blue-600 hover:text-blue-800 p-1"
                                            title="Alterar senha"
                                        >
                                            <Key className="h-4 w-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(user.id, user.name)}
                                            className="text-red-600 hover:text-red-800 p-1"
                                            title="Excluir usuário"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
                {users.map((user) => (
                    <div key={user.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                                {user.phone && (
                                    <p className="text-sm text-gray-500 mt-1">{user.phone}</p>
                                )}
                            </div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                {user.role === 'ADMIN' ? 'Admin' : 'User'}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500">
                            Criado em {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <Link
                                href={`/dashboard/users/${user.id}/edit`}
                                className="flex items-center gap-1 text-sm text-[#6d7749] hover:text-[#5d6541]"
                            >
                                <Edit className="h-4 w-4" />
                                Editar
                            </Link>
                            <Link
                                href={`/dashboard/users/${user.id}/password`}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                                <Key className="h-4 w-4" />
                                Senha
                            </Link>
                            <button
                                onClick={() => handleDelete(user.id, user.name)}
                                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                            >
                                <Trash2 className="h-4 w-4" />
                                Excluir
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
