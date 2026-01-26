'use client';

import { updateMassParticipants } from '@/lib/actions';
import { useActionState } from 'react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Button } from '../button';
import { TagInput } from '../tag-input';
import { formatLongDateTimeUTC, formatDateOnlyUTC } from '@/lib/date-utils';
import ShareButton from '../share-button';
import { useRouter } from 'next/navigation';

type RoleTuple = [string, number];

interface Mass {
    id: string;
    slug: string;
    date: Date;
    participants: Record<string, string[]>;
}

interface EditParticipantsPageProps {
    mass: Mass;
    config: any;
    shareUrl: string;
}

export default function EditParticipantsPage({ mass, config, shareUrl }: EditParticipantsPageProps) {
    const router = useRouter();
    const [state, dispatch, isPending] = useActionState(
        (prevState: any, formData: FormData) => updateMassParticipants(mass.id, prevState, formData),
        undefined
    );

    // Parse participantConfig - it's an array of tuples [roleName, quantity]
    const participantConfig = config?.participantConfig as { roles?: RoleTuple[] } | undefined;
    const roleTuples: RoleTuple[] = participantConfig?.roles || [
        ["Ministro", 1],
        ["Catequista", 1],
        ["Coroinha", 1],
        ["Cantor", 1]
    ];

    // Initialize state with existing participants
    const [participantsByRole, setParticipantsByRole] = useState<Record<string, string[]>>(
        roleTuples.reduce((acc: Record<string, string[]>, [role]: RoleTuple) => {
            acc[role] = mass.participants[role] || [];
            return acc;
        }, {})
    );

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
                // Optionally redirect or show success message
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    const handleSubmit = async (formData: FormData) => {
        // Add all participants for each role
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Editar Participantes</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {formatLongDateTimeUTC(mass.date)}
                    </p>
                </div>
                <ShareButton 
                    url={shareUrl}
                    title={`Editar Participantes - ${formatDateOnlyUTC(mass.date)}`}
                    text="Compartilhe este link para editar os participantes da missa"
                />
            </div>

            <form action={handleSubmit} className="space-y-6">
                <div className="border-t border-gray-200 pt-6">
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

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button 
                        type="submit" 
                        variant="form-primary" 
                        className="flex-1" 
                        disabled={isPending}
                    >
                        {isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

