'use client';

import { updateMassParticipants } from '@/lib/actions';
import { useActionState } from 'react';
import { toast } from 'sonner';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Button } from '../button';
import { TagInput } from '../tag-input';
import { formatLongDateTime } from '@/lib/date-utils';

type RoleTuple = [string, number];

interface Mass {
    id: string;
    slug: string;
    date: Date;
    participants: Record<string, string[]>;
}

interface EditParticipantsModalProps {
    mass: Mass;
    config: { participantConfig?: { roles?: RoleTuple[] } };
    isOpen: boolean;
    onClose: () => void;
    isLoggedIn?: boolean;
}

export default function EditParticipantsModal({ mass, config, isOpen, onClose, isLoggedIn = false }: EditParticipantsModalProps) {
    const [state, , isPending] = useActionState(
        (prevState: unknown, formData: FormData) => updateMassParticipants(mass.id, prevState, formData),
        null
    );

    // Parse participantConfig - it's an array of tuples [roleName, quantity]
    const participantConfig = config?.participantConfig as { roles?: RoleTuple[] } | undefined;
    const roleTuples = useMemo((): RoleTuple[] => {
        return participantConfig?.roles || [
            ["Ministro", 1],
            ["Catequista", 1],
            ["Coroinha", 1],
            ["Cantor", 1]
        ];
    }, [participantConfig?.roles]);

    // Initialize state with existing participants
    const [participantsByRole, setParticipantsByRole] = useState<Record<string, string[]>>(
        roleTuples.reduce((acc: Record<string, string[]>, [role]: RoleTuple) => {
            acc[role] = mass.participants[role] || [];
            return acc;
        }, {})
    );

    // Auto-save state
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedRef = useRef<Record<string, string[]>>(JSON.parse(JSON.stringify(participantsByRole)));

    // Auto-save effect with debounce
    useEffect(() => {
        if (!isOpen) return;

        // Clear existing timeout
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        // Check if anything changed
        const hasChanges = JSON.stringify(participantsByRole) !== JSON.stringify(lastSavedRef.current);
        if (!hasChanges) return;

        // Debounce auto-save (300ms)
        autoSaveTimeoutRef.current = setTimeout(async () => {
            setAutoSaveStatus('saving');
            
            try {
                const formData = new FormData();
                Object.entries(participantsByRole).forEach(([role, names]) => {
                    names.forEach((name) => {
                        if (name.trim() !== '') {
                            formData.append(`role_${role}`, name.trim());
                        }
                    });
                });
                // Add updatedAt for optimistic locking
                formData.append('_updatedAt', new Date().toISOString());

                const result = await updateMassParticipants(mass.id, undefined, formData);
                
                if (result?.success) {
                    setAutoSaveStatus('saved');
                    lastSavedRef.current = JSON.parse(JSON.stringify(participantsByRole));
                    
                    // Reset status after 2 seconds
                    setTimeout(() => setAutoSaveStatus('idle'), 2000);
                } else if (result?.conflict) {
                    setAutoSaveStatus('error');
                    toast.error(result.message);
                    // Reload to get latest data
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    setAutoSaveStatus('error');
                    if (result?.message) {
                        toast.error(result.message);
                    }
                    // Reset status after 3 seconds
                    setTimeout(() => setAutoSaveStatus('idle'), 3000);
                }
            } catch (err) {
                console.error('Auto-save error:', err);
                setAutoSaveStatus('error');
                toast.error('Erro ao salvar participantes');
                setTimeout(() => setAutoSaveStatus('idle'), 3000);
            }
        }, 300);

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [participantsByRole, isOpen, mass.id]);

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
                onClose();
            } else {
                toast.error(state.message);
            }
        }
    }, [state?.message, state?.success, onClose]);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) return;
        
        const newParticipants = roleTuples.reduce((acc: Record<string, string[]>, [role]: RoleTuple) => {
            acc[role] = mass.participants[role] || [];
            return acc;
        }, {});
        
        setParticipantsByRole(newParticipants);
        lastSavedRef.current = JSON.parse(JSON.stringify(newParticipants));
        setAutoSaveStatus('idle');
    }, [isOpen, mass.participants, roleTuples]);

    const handleSubmit = async (formData: FormData) => {
        // Add all participants for each role
        Object.entries(participantsByRole).forEach(([role, names]) => {
            names.forEach((name) => {
                if (name.trim() !== '') {
                    formData.append(`role_${role}`, name.trim());
                }
            });
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div 
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Editar Participantes</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {formatLongDateTime(mass.date)}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Fechar"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
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
                                        canRemove={isLoggedIn}
                                        saveStatus={autoSaveStatus}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <Button 
                                type="button"
                                variant="form-secondary"
                                className="flex-1" 
                                onClick={onClose}
                            >
                                Cancelar
                            </Button>
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
            </div>
        </div>
    );
}

