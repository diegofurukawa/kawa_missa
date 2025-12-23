'use client';

import { upsertTenant } from '@/lib/actions';
import { useActionState } from 'react';
import { Button } from '../button';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function OrganizationForm({ tenant }: { tenant?: any }) {
    const [state, dispatch, isPending] = useActionState(upsertTenant, undefined);

    const address = tenant?.address || {};

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
            } else {
                toast.error(state.message);
            }
        }
    }, [state?.message, state?.success]);

    return (
        <form action={dispatch} className="space-y-6 max-w-2xl bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Detalhes da Organização</h2>
                <p className="text-sm text-gray-500">Configure as informações da sua organização</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Denominação (Nome da Igreja)</label>
                    <input 
                        name="denomination" 
                        defaultValue={tenant?.denomination} 
                        required 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Razão Social</label>
                    <input 
                        name="legalName" 
                        defaultValue={tenant?.legalName} 
                        required 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Documento (CNPJ/CPF)</label>
                    <input 
                        name="document" 
                        defaultValue={tenant?.document} 
                        required 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Responsável</label>
                    <input 
                        name="responsibleName" 
                        defaultValue={tenant?.responsibleName} 
                        required 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors" 
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
                <input 
                    name="phone" 
                    defaultValue={tenant?.phone} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors" 
                />
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Endereço</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">CEP</label>
                        <input 
                            name="zipCode" 
                            defaultValue={address.zipCode} 
                            required 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Endereço (Rua)</label>
                        <input 
                            name="street" 
                            defaultValue={address.street} 
                            required 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors" 
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Número</label>
                        <input 
                            name="number" 
                            defaultValue={address.number} 
                            required 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Bairro</label>
                        <input 
                            name="neighborhood" 
                            defaultValue={address.neighborhood} 
                            required 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Cidade</label>
                        <input 
                            name="city" 
                            defaultValue={address.city} 
                            required 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors" 
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
                        <input 
                            name="state" 
                            defaultValue={address.state} 
                            required 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors" 
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <Button variant="form-primary" className="w-full justify-center" disabled={isPending}>
                    {tenant ? 'Salvar Alterações' : 'Criar Organização'}
                </Button>
            </div>
        </form>
    );
}
