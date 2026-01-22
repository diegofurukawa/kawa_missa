'use client';

import { updateUser } from '@/lib/actions';
import { useActionState } from 'react';
import { Button } from '@/app/ui/button';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
};

export default function EditUserForm({ user }: { user: User }) {
    const updateUserWithId = updateUser.bind(null, user.id);
    const [state, dispatch, isPending] = useActionState(updateUserWithId, undefined);
    const router = useRouter();

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
                router.push('/dashboard/users');
            } else {
                toast.error(state.message);
            }
        }
    }, [state?.message, state?.success, router]);

    return (
        <form action={dispatch} className="space-y-6 max-w-2xl bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Editar Usuário</h2>
                <p className="text-sm text-gray-500">Atualize os dados do usuário</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome Completo *</label>
                    <input
                        name="name"
                        defaultValue={user.name}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors"
                    />
                    {state?.errors?.name && <p className="mt-1 text-xs text-red-600">{state.errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                    <input
                        name="email"
                        type="email"
                        defaultValue={user.email}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors"
                    />
                    {state?.errors?.email && <p className="mt-1 text-xs text-red-600">{state.errors.email}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
                    <input
                        name="phone"
                        type="tel"
                        defaultValue={user.phone || ''}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Função *</label>
                    <select
                        name="role"
                        required
                        defaultValue={user.role}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors"
                    >
                        <option value="USER">Usuário</option>
                        <option value="ADMIN">Administrador</option>
                    </select>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Para alterar a senha, use a opção "Alterar Senha" na lista de usuários.
                </p>
            </div>

            <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="secondary"
                    className="flex-1 justify-center"
                    onClick={() => router.back()}
                >
                    Cancelar
                </Button>
                <Button
                    variant="form-primary"
                    className="flex-1 justify-center"
                    disabled={isPending}
                >
                    {isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>
        </form>
    );
}
