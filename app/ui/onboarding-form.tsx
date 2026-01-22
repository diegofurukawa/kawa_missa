'use client';

import { createTenant } from '@/lib/actions';
import { useActionState } from 'react';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function OnboardingForm() {
    const [state, dispatch, isPending] = useActionState(createTenant, undefined);

    useEffect(() => {
        if (state?.message) {
            toast.error(state.message);
        }
    }, [state?.message]);

    return (
        <form action={dispatch} className="space-y-3">
            <div className="flex-1 rounded-lg bg-white px-6 pb-4 pt-8 shadow-md">
                <h1 className="mb-3 text-2xl font-semibold text-gray-900">
                    Bem-vindo! Crie sua Organização
                </h1>
                <p className="mb-6 text-sm text-gray-600">
                    Preencha os dados da sua organização e do administrador
                </p>

                {/* Organization Section */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Dados da Organização</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Tenant Name */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700" htmlFor="tenantName">
                                Nome da Organização *
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="tenantName" type="text" name="tenantName" placeholder="Paróquia São José" required
                            />
                            {state?.errors?.tenantName && <p className="mt-1 text-xs text-red-600">{state.errors.tenantName}</p>}
                        </div>

                        {/* Denomination */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700" htmlFor="denomination">
                                Denominação (Nome da Igreja) *
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="denomination" type="text" name="denomination" placeholder="Igreja Católica Apostólica Romana" required
                            />
                        </div>

                        {/* Legal Name */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700" htmlFor="legalName">
                                Razão Social *
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="legalName" type="text" name="legalName" placeholder="Paróquia São José LTDA" required
                            />
                        </div>

                        {/* Document */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700" htmlFor="document">
                                Documento (CNPJ/CPF) *
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="document" type="text" name="document" placeholder="00.000.000/0000-00" required
                            />
                        </div>

                        {/* Responsible Name */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700" htmlFor="responsibleName">
                                Responsável *
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="responsibleName" type="text" name="responsibleName" placeholder="Padre João Silva" required
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700" htmlFor="orgPhone">
                                Telefone da Organização
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="orgPhone" type="tel" name="orgPhone" placeholder="(11) 3333-4444"
                            />
                        </div>
                    </div>

                    {/* Address Section */}
                    <h3 className="text-md font-semibold text-gray-700 mt-4 mb-2">Endereço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700" htmlFor="zipCode">
                                CEP *
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="zipCode" type="text" name="zipCode" placeholder="00000-000" required
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700" htmlFor="street">
                                Rua *
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="street" type="text" name="street" placeholder="Rua das Flores" required
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700" htmlFor="number">
                                Número *
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="number" type="text" name="number" placeholder="123" required
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700" htmlFor="neighborhood">
                                Bairro *
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="neighborhood" type="text" name="neighborhood" placeholder="Centro" required
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700" htmlFor="city">
                                Cidade *
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="city" type="text" name="city" placeholder="São Paulo" required
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700" htmlFor="state">
                                Estado *
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="state" type="text" name="state" placeholder="SP" required maxLength={2}
                            />
                        </div>
                    </div>
                </div>

                {/* Admin User Section */}
                <div className="pt-2">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Dados do Administrador</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* User Name */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700" htmlFor="userName">
                                Nome Completo *
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="userName" type="text" name="userName" placeholder="João Silva" required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700" htmlFor="email">
                                Email *
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="email" type="email" name="email" placeholder="joao@example.com" required
                            />
                            {state?.errors?.email && <p className="mt-1 text-xs text-red-600">{state.errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700" htmlFor="password">
                                Senha *
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="password" type="password" name="password" required minLength={6}
                            />
                            {state?.errors?.password && <p className="mt-1 text-xs text-red-600">{state.errors.password}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700" htmlFor="userPhone">
                                Telefone Pessoal
                            </label>
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="userPhone" type="tel" name="userPhone" placeholder="(11) 99999-9999"
                            />
                        </div>
                    </div>
                </div>

                <button
                    className="mt-6 w-full bg-[#6d7749] hover:bg-[#5d6541] text-white p-2.5 rounded-md font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-disabled={isPending}
                    disabled={isPending}
                >
                    {isPending ? 'Criando Conta...' : 'Criar Conta'}
                </button>
            </div>
        </form>
    );
}
