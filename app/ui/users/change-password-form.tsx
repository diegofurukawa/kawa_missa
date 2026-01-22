'use client';

import { changeUserPassword } from '@/lib/actions';
import { useActionState } from 'react';
import { Button } from '@/app/ui/button';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
    id: string;
    name: string;
    email: string;
};

export default function ChangePasswordForm({ user }: { user: User }) {
    const changePasswordWithId = changeUserPassword.bind(null, user.id);
    const [state, dispatch, isPending] = useActionState(changePasswordWithId, undefined);
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
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Alterar Senha</h2>
                <p className="text-sm text-gray-500">Alterando senha para: <strong>{user.name}</strong> ({user.email})</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nova Senha *</label>
                <input
                    name="newPassword"
                    type="password"
                    required
                    minLength={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors"
                    placeholder="Mínimo 6 caracteres"
                />
                {state?.errors?.newPassword && <p className="mt-1 text-xs text-red-600">{state.errors.newPassword}</p>}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                    <strong>Atenção:</strong> O usuário precisará usar esta nova senha no próximo login.
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
                    {isPending ? 'Alterando...' : 'Alterar Senha'}
                </Button>
            </div>
        </form>
    );
}
