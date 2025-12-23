'use client';

import { updateMass } from '@/lib/actions';
import { useActionState } from 'react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Button } from '../button';
import { TagInput } from '../tag-input';
import { format } from 'date-fns';

type RoleTuple = [string, number];

interface Mass {
    id: string;
    slug: string;
    date: Date;
    participants: Record<string, string[]>;
}

export default function EditMassForm({ mass, tenant, config }: { mass: Mass; tenant: any; config: any }) {
    const updateMassWithId = async (prevState: any, formData: FormData) => {
        return await updateMass(mass.id, prevState, formData);
    };
    
    const [state, dispatch, isPending] = useActionState(updateMassWithId, undefined);

    // Parse participantConfig - it's an array of tuples [roleName, quantity]
    const participantConfig = config?.participantConfig as { roles?: RoleTuple[] } | undefined;
    const roleTuples: RoleTuple[] = participantConfig?.roles || [
        ["Ministro", 1],
        ["Catequista", 1],
        ["Coroinha", 1],
        ["Cantor", 1]
    ];

    // Initialize state with existing mass data
    const [participantsByRole, setParticipantsByRole] = useState<Record<string, string[]>>(
        roleTuples.reduce((acc: Record<string, string[]>, [role]: RoleTuple) => {
            acc[role] = mass.participants[role] || [];
            return acc;
        }, {})
    );

    // Initialize date and time from existing mass
    const massDate = new Date(mass.date);
    const [date, setDate] = useState<string>(format(massDate, 'yyyy-MM-dd'));
    const [time, setTime] = useState<string>(format(massDate, 'HH:mm'));

    useEffect(() => {
        if (state?.message) {
            toast.error(state.message);
        }
    }, [state?.message]);

    const handleSubmit = async (formData: FormData) => {
        // Combine date and time into ISO datetime string
        if (date && time) {
            const dateTimeString = `${date}T${time}`;
            formData.set('date', dateTimeString);
        }

        // Add all participants for each role
        // Format: role_${role} as key, and append multiple values with the same key
        Object.entries(participantsByRole).forEach(([role, names]) => {
            names.forEach((name) => {
                if (name.trim() !== '') {
                    formData.append(`role_${role}`, name.trim());
                }
            });
        });
        
        dispatch(formData);
    };

    return (
        <form action={handleSubmit} className="space-y-6 max-w-2xl bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <input type="hidden" name="tenantId" value={tenant.id} />

            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Editar Missa</h2>
                <p className="text-sm text-gray-500">Atualize os dados da missa</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Data
                        </label>
                        <input 
                            type="date" 
                            name="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors" 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Hora
                        </label>
                        <input 
                            type="time" 
                            name="time" 
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors" 
                        />
                    </div>
                </div>
            </div>

            <div className='border-t border-gray-200 pt-6 mt-6'>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Participantes</h3>
                <div className="space-y-4">
                    {roleTuples.map(([role, quantity]: RoleTuple) => (
                        <TagInput
                            key={role}
                            tags={participantsByRole[role] || []}
                            onTagsChange={(tags) => {
                                setParticipantsByRole(prev => ({
                                    ...prev,
                                    [role]: tags
                                }));
                            }}
                            label={`${role} (${quantity})`}
                            placeholder={`Digite o nome do ${role}`}
                            maxTags={quantity}
                        />
                    ))}
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button 
                    type="submit" 
                    variant="form-primary" 
                    className="w-full" 
                    disabled={isPending}
                >
                    {isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>
        </form>
    );
}

