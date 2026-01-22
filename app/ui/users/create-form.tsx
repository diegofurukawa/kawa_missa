'use client';

import { createUser } from '@/lib/actions';
import { useActionState } from 'react';
import { Button } from '@/app/ui/button';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateUserForm() {
    const [state, dispatch, isPending] = useActionState(createUser, undefined);
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
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Novo Usuário</h2>
                <p className="text-sm text-gray-500">Preencha os dados do novo usuário</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome Completo *</label>
                    <input
                        name="name"
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors"
                        placeholder="João Silva"
                    />
                    {state?.errors?.name && <p className="mt-1 text-xs text-red-600">{state.errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors"
                        placeholder="joao@example.com"
                    />
                    {state?.errors?.email && <p className="mt-1 text-xs text-red-600">{state.errors.email}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
                    <input
                        name="phone"
                        type="tel"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors"
                        placeholder="(11) 99999-9999"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Função *</label>
                    <select
                        name="role"
                        required
                        defaultValue="USER"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors"
                    >
                        <option value="USER">Usuário</option>
                        <option value="ADMIN">Administrador</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha *</label>
                    <input
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors"
                        placeholder="Mínimo 6 caracteres"
                    />
                    {state?.errors?.password && <p className="mt-1 text-xs text-red-600">{state.errors.password}</p>}
                </div>
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
                    {isPending ? 'Criando...' : 'Criar Usuário'}
                </Button>
            </div>
        </form>
    );
}
