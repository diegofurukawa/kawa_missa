'use client';

import { createConfig, updateConfig } from '@/lib/actions';
import { useActionState } from 'react';
import { Button } from '../button';
import { toast } from 'sonner';
import { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import CronBuilder from './cron-builder';

type RoleEntry = [string, number]; // [role, quantidade]

interface Config {
    id: string;
    cronConfig: { frequency?: string[] };
    participantConfig: { roles?: [string, number][] };
}

interface ConfigFormProps {
    config?: Config | null;
}

export default function ConfigForm({ config }: ConfigFormProps) {
    const isEditMode = !!config;
    
    const updateConfigWithId = async (prevState: unknown, formData: FormData) => {
        if (!config) return { message: 'Config não encontrada' };
        return await updateConfig(config.id, prevState, formData);
    };

    const [state, dispatch, isPending] = useActionState(
        isEditMode ? updateConfigWithId : createConfig,
        undefined
    );

    // Initialize state from config if editing
    const getInitialCronExpression = () => {
        if (config?.cronConfig?.frequency && config.cronConfig.frequency.length > 0) {
            return config.cronConfig.frequency[0];
        }
        return '';
    };

    const getInitialRoleEntries = (): RoleEntry[] => {
        if (config?.participantConfig?.roles && config.participantConfig.roles.length > 0) {
            return config.participantConfig.roles;
        }
        return [['', 1]];
    };

    // State for single cron expression
    const [cronExpression, setCronExpression] = useState<string>(getInitialCronExpression());

    // State for role entries: array of [role, quantidade]
    const [roleEntries, setRoleEntries] = useState<RoleEntry[]>(getInitialRoleEntries());
    
    // Refs para os inputs de nome do role (para focar após adicionar)
    const roleInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
    
    // State para rastrear o último índice adicionado (para focar)
    const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null);

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

    // Focus no novo input quando um role é adicionado
    useEffect(() => {
        if (lastAddedIndex !== null) {
            const input = roleInputRefs.current.get(lastAddedIndex);
            if (input) {
                // Usar setTimeout para garantir que o DOM foi atualizado
                setTimeout(() => {
                    input.focus();
                }, 0);
            }
            setLastAddedIndex(null);
        }
    }, [lastAddedIndex]);

    const handleSubmit = async (formData: FormData) => {
        // Add single cron expression
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
    const updateCronExpression = (cron: string) => {
        setCronExpression(cron);
    };

    // Role entry handlers
    const addRoleEntry = () => {
        const newIndex = roleEntries.length;
        setRoleEntries([...roleEntries, ['', 1]]);
        setLastAddedIndex(newIndex);
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
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {isEditMode ? 'Editar Configuração' : 'Configurações'}
                </h2>
                <p className="text-sm text-gray-500">
                    {isEditMode 
                        ? 'Atualize as expressões cron e roles de participantes'
                        : 'Configure expressões cron e roles de participantes'
                    }
                </p>
            </div>

            {/* Cron Config Section */}
            <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuração de Agendamento</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Configure quando as missas devem ser agendadas automaticamente
                </p>
                <div>
                    <CronBuilder
                        value={cronExpression}
                        onChange={updateCronExpression}
                    />
                </div>
            </div>

            {/* Participant Config Section */}
            <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Configuração de Participantes</h3>
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
                                    ref={(el) => {
                                        if (el) {
                                            roleInputRefs.current.set(index, el);
                                        } else {
                                            roleInputRefs.current.delete(index);
                                        }
                                    }}
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
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg p-2 transition-colors mt-6 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                    aria-label="Remover"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={addRoleEntry}
                        className="text-sm"
                    >
                        + Adicionar Role
                    </Button>
                </div>
            </div>

            <div className="pt-4">
                <Button variant="form-primary" className="w-full justify-center" disabled={isPending}>
                    {isPending 
                        ? 'Salvando...' 
                        : isEditMode 
                            ? 'Atualizar Configuração' 
                            : 'Salvar Configuração'
                    }
                </Button>
            </div>
        </form>
    );
}
