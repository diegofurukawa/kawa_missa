'use client';

import { updateMassParticipants } from '@/lib/actions';
import { toast } from 'sonner';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Button } from '../button';
import { TagInput } from '../tag-input';
import { formatLongDateTime } from '@/lib/date-utils';

type RoleTuple = [string, number];

// CR-021: updatedAt e date tipados como Date | string para refletir serialização JSON do Next.js
interface Mass {
    id: string;
    slug: string;
    date: Date | string;
    updatedAt: Date | string;
    participants: Record<string, string[]>;
}

interface EditParticipantsModalProps {
    mass: Mass;
    config: { participantConfig?: { roles?: RoleTuple[] } };
    isOpen: boolean;
    onClose: () => void;
    isLoggedIn?: boolean;
}

// CR-019: Comparação de participantes order-independent, definida fora do componente
function participantsEqual(a: Record<string, string[]>, b: Record<string, string[]>): boolean {
    const keysA = Object.keys(a).sort();
    const keysB = Object.keys(b).sort();
    if (keysA.join(',') !== keysB.join(',')) return false;
    return keysA.every(k => JSON.stringify(a[k]) === JSON.stringify(b[k]));
}

// CR-021: Conversão segura de Date | string para string ISO
function toISOStringSafe(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : value;
}

export default function EditParticipantsModal({ mass, config, isOpen, onClose, isLoggedIn = false }: EditParticipantsModalProps) {
    // CR-016: useActionState removido — salvamento unificado no auto-save

    const participantConfig = config?.participantConfig as { roles?: RoleTuple[] } | undefined;

    // CR-017: Sem fallback hardcoded; roles vêm exclusivamente da config
    const roleTuples = useMemo((): RoleTuple[] => {
        return participantConfig?.roles ?? [];
    }, [participantConfig?.roles]);

    const hasRoles = roleTuples.length > 0;

    // Initialize state with existing participants
    const [participantsByRole, setParticipantsByRole] = useState<Record<string, string[]>>(
        roleTuples.reduce((acc: Record<string, string[]>, [role]: RoleTuple) => {
            acc[role] = mass.participants[role] || [];
            return acc;
        }, {})
    );

    // CR-024: Fecha o modal somente quando TODOS os roles estão preenchidos
    const allRolesFull = roleTuples.every(
        ([role, quantity]) => (participantsByRole[role]?.length ?? 0) >= quantity
    );
    const handleMaxTagsReached = allRolesFull ? onClose : undefined;

    // Auto-save state
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    // CR-015: Estado de conflito explícito — substitui o reload automático
    const [hasConflict, setHasConflict] = useState(false);

    // CR-018: Tipo corrigido para ReturnType<typeof setTimeout>
    const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // CR-020: Ref para timeout de status com cleanup
    const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // CR-019: Deep clone estruturado sem JSON.parse/JSON.stringify
    const lastSavedRef = useRef<Record<string, string[]>>(
        Object.fromEntries(Object.entries(participantsByRole).map(([k, v]) => [k, [...v]]))
    );
    // CR-021: Conversão segura para string ISO
    const serverUpdatedAtRef = useRef<string>(toISOStringSafe(mass.updatedAt));

    // CR-020/CR-026: Helper estabilizado com useCallback — evita recriação a cada render
    const setStatusWithTimeout = useCallback((status: 'idle' | 'saving' | 'saved' | 'error', delay: number) => {
        if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
        statusTimeoutRef.current = setTimeout(() => setAutoSaveStatus(status), delay);
    }, []);

    // Auto-save effect with debounce
    useEffect(() => {
        if (!isOpen) return;
        // CR-017: Sem roles configurados, não auto-salvar
        if (!hasRoles) return;

        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        // CR-019: Comparação order-independent via função dedicada
        const hasChanges = !participantsEqual(participantsByRole, lastSavedRef.current);
        if (!hasChanges) return;

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
                formData.append('_updatedAt', serverUpdatedAtRef.current);

                const result = await updateMassParticipants(mass.id, undefined, formData);

                if (result?.success) {
                    setAutoSaveStatus('saved');
                    // CR-019: Deep clone estruturado
                    lastSavedRef.current = Object.fromEntries(
                        Object.entries(participantsByRole).map(([k, v]) => [k, [...v]])
                    );
                    if (result.currentUpdatedAt) {
                        serverUpdatedAtRef.current = result.currentUpdatedAt;
                    }
                    toast.success('Salvo com sucesso');
                    // Fecha o modal após salvar (não logado: volta para lista de Cards)
                    onClose();
                } else if (result?.conflict) {
                    setAutoSaveStatus('error');
                    toast.error(result.message);
                    // CR-015: Exibe banner de conflito — reload é ação explícita do usuário
                    setHasConflict(true);
                } else {
                    setAutoSaveStatus('error');
                    if (result?.message) {
                        toast.error(result.message);
                    }
                    // CR-020: Timeout de status com ref e cleanup
                    setStatusWithTimeout('idle', 3000);
                }
            } catch (err) {
                console.error('Auto-save error:', err);
                setAutoSaveStatus('error');
                toast.error('Erro ao salvar participantes');
                // CR-020: Timeout de status com ref e cleanup
                setStatusWithTimeout('idle', 3000);
            }
        }, 300);

        return () => {
            if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
            // CR-020: Cleanup do statusTimeoutRef no cleanup do effect
            if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
        };
    }, [participantsByRole, isOpen, mass.id, hasRoles, setStatusWithTimeout, onClose]);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) return;

        const newParticipants = roleTuples.reduce((acc: Record<string, string[]>, [role]: RoleTuple) => {
            acc[role] = mass.participants[role] || [];
            return acc;
        }, {});

        setParticipantsByRole(newParticipants);
        // CR-019: Deep clone estruturado
        lastSavedRef.current = Object.fromEntries(
            Object.entries(newParticipants).map(([k, v]) => [k, [...v]])
        );
        // CR-021: Conversão segura
        serverUpdatedAtRef.current = toISOStringSafe(mass.updatedAt);
        setAutoSaveStatus('idle');
        // CR-015: Resetar estado de conflito ao reabrir
        setHasConflict(false);
    }, [isOpen, mass.participants, mass.updatedAt, roleTuples]);

    // CR-022: Handler de Escape para fechar o modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        // CR-022: role="dialog", aria-modal, aria-labelledby adicionados
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-participants-title"
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            {/* CR-022: id para aria-labelledby */}
                            <h2 id="edit-participants-title" className="text-2xl font-bold text-gray-900">Editar Participantes</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {/* CR-021: formatLongDateTime recebe Date | string — sem chamada a .toISOString() aqui */}
                                {formatLongDateTime(mass.date instanceof Date ? mass.date : new Date(mass.date))}
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

                    {/* CR-015: Banner de conflito — ação de reload é explícita do usuário */}
                    {hasConflict && (
                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg flex items-center justify-between gap-4">
                            <p className="text-sm text-yellow-800">
                                Conflito detectado: os dados foram alterados por outro usuário. Recarregue para ver a versão mais recente.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="shrink-0 text-sm font-medium text-yellow-900 underline hover:no-underline"
                            >
                                Recarregar página
                            </button>
                        </div>
                    )}

                    {/* CR-016: form sem action/useActionState — auto-save é o único mecanismo */}
                    <div className="space-y-6">
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Participantes</h3>

                            {/* CR-017: Estado vazio quando não há roles configurados */}
                            {!hasRoles ? (
                                <p className="text-sm text-gray-500">
                                    Nenhuma configuração de participantes definida. Configure os papéis em Configurações.
                                </p>
                            ) : (
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
                                            onMaxTagsReached={handleMaxTagsReached}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* CR-016: Botão "Fechar" substitui o botão "Salvar" — auto-save persiste os dados */}
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
                                type="button"
                                variant="form-primary"
                                className="flex-1"
                                onClick={onClose}
                            >
                                Fechar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
