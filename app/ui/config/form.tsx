'use client';

import { createConfig } from '@/lib/actions';
import { useActionState } from 'react';
import { Button } from '../button';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { TagInput } from '../tag-input';

type RoleEntry = [string, number]; // [role, quantidade]

export default function ConfigForm() {
    const [state, dispatch, isPending] = useActionState(createConfig, undefined);

    // State for single cron expression (TAG)
    const [cronExpression, setCronExpression] = useState<string>('');

    // State for role entries: array of [role, quantidade]
    const [roleEntries, setRoleEntries] = useState<RoleEntry[]>([['', 1]]);

    useEffect(() => {
        if (state?.message) {
            // If there are errors, it's an error state, otherwise it's just a message (likely an error too)
            if (state.errors) {
                toast.error(state.message);
            } else {
                // This shouldn't normally happen as successful creates redirect
                toast.error(state.message);
            }
        }
    }, [state]);

    const handleSubmit = async (formData: FormData) => {
        // Add single cron expression (TAG)
        if (cronExpression.trim() !== '') {
            formData.append('cron_0', cronExpression.trim());
        }

        // Add roles with quantities
        roleEntries.forEach(([role, qty], index) => {
            if (role.trim() && qty > 0) {
                formData.append(`role_${index}`, role.trim());
                formData.append(`qty_${index}`, qty.toString());
            }
        });

        dispatch(formData);
    };

    // Cron expression handler
    const updateCronExpression = (tags: string[]) => {
        // TagInput returns array, we take the first tag or empty string
        setCronExpression(tags.length > 0 ? tags[0] : '');
    };

    // Role entry handlers
    const addRoleEntry = () => {
        setRoleEntries([...roleEntries, ['', 1]]);
    };

    const removeRoleEntry = (index: number) => {
        const filtered = roleEntries.filter((_, i) => i !== index);
        setRoleEntries(filtered.length > 0 ? filtered : [['', 1]]);
    };

    const updateRoleName = (index: number, role: string) => {
        const updated = [...roleEntries];
        updated[index] = [role, updated[index][1]];
        setRoleEntries(updated);
    };

    const updateRoleQuantity = (index: number, qty: number) => {
        const updated = [...roleEntries];
        updated[index] = [updated[index][0], qty];
        setRoleEntries(updated);
    };

    return (
        <form action={handleSubmit} className="space-y-6 max-w-2xl bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Configurações</h2>
                <p className="text-sm text-gray-500">Configure expressões cron e roles de participantes</p>
            </div>

            {/* Cron Config Section */}
            <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuração de Cron</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Configure a expressão cron de execução (formato: min hour day month weekday)
                </p>
                <div>
                    <TagInput
                        tags={cronExpression ? [cronExpression] : []}
                        onTagsChange={updateCronExpression}
                        placeholder="Digite a expressão cron e pressione Enter (ex: 30 19 * * 6)"
                        label="Expressão Cron"
                        maxTags={1}
                    />
                </div>
            </div>

            {/* Participant Config Section */}
            <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Configuração de Participantes</h3>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={addRoleEntry}
                        className="text-sm"
                    >
                        + Adicionar Role
                    </Button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    Configure os roles disponíveis e a quantidade de participantes para cada role
                </p>
                <div className="space-y-3">
                    {roleEntries.map(([role, qty], index) => (
                        <div key={index} className="flex gap-2 items-start">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Nome do Role
                                </label>
                                <input
                                    type="text"
                                    value={role}
                                    onChange={(e) => updateRoleName(index, e.target.value)}
                                    placeholder="Ex: Padre, Ministro, Catequista"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors placeholder:text-gray-400"
                                />
                            </div>
                            <div className="w-32">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Quantidade
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={qty}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 1;
                                        updateRoleQuantity(index, value);
                                    }}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors"
                                />
                            </div>
                            {roleEntries.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeRoleEntry(index)}
                                    className="text-red-600 hover:text-red-700 font-medium text-sm px-3 py-2 transition-colors mt-6"
                                >
                                    Remover
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4">
                <Button variant="form-primary" className="w-full justify-center" disabled={isPending}>
                    {isPending ? 'Salvando...' : 'Salvar Configuração'}
                </Button>
            </div>
        </form>
    );
}
