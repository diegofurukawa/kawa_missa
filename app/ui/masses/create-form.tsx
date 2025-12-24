'use client';

import { createMass, createMasses } from '@/lib/actions';
import { useActionState } from 'react';
import { toast } from 'sonner';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../button';
import { TagInput } from '../tag-input';
import DateInput from '../date-input';
import TimeInput from '../time-input';
import RichTextEditor from '../rich-text-editor';
import { isNearValidCronDate, formatCronDescription } from '@/lib/cron-utils';
import { combineLocalDateTime } from '@/lib/date-utils';

type RoleTuple = [string, number];

interface Config {
    id: string;
    cronConfig: { frequency?: string[] };
    participantConfig: { roles?: RoleTuple[] };
}

export default function CreateMassForm({ tenant, configs }: { tenant: any; configs: Config[] }) {
    const router = useRouter();
    const [state, dispatch, isPending] = useActionState(createMass, undefined);
    const [stateMulti, dispatchMulti, isPendingMulti] = useActionState(createMasses, undefined);

    // State for selected config
    const [selectedConfigId, setSelectedConfigId] = useState<string>('');
    const selectedConfig = useMemo(() => {
        return configs.find(c => c.id === selectedConfigId) || null;
    }, [configs, selectedConfigId]);

    // Get cron expression from selected config
    const cronExpression = useMemo(() => {
        if (!selectedConfig) return null;
        const cronConfig = selectedConfig.cronConfig as { frequency?: string[] };
        const frequencies = cronConfig?.frequency || [];
        return frequencies.length > 0 ? frequencies[0] : null;
    }, [selectedConfig]);

    // Parse participantConfig from selected config or use default
    const participantConfig = selectedConfig?.participantConfig as { roles?: RoleTuple[] } | undefined;
    const roleTuples: RoleTuple[] = participantConfig?.roles || [
        ["Ministro", 1],
        ["Catequista", 1],
        ["Coroinha", 1],
        ["Cantor", 1]
    ];

    // State for participants by role
    const [participantsByRole, setParticipantsByRole] = useState<Record<string, string[]>>(
        roleTuples.reduce((acc: Record<string, string[]>, [role]: RoleTuple) => {
            acc[role] = [];
            return acc;
        }, {})
    );

    // State for date and time
    const [date, setDate] = useState<string>('');
    const [time, setTime] = useState<string>('');

    // State for multiple date selection
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);

    // State for type and description
    const [type, setType] = useState<string>('Missa');
    const [description, setDescription] = useState<string>('');

    // State for suggested dates from CRON
    const [suggestedDates, setSuggestedDates] = useState<Date[]>([]);
    const [dateValidationMessage, setDateValidationMessage] = useState<string>('');

    // Update role tuples when config changes
    useEffect(() => {
        const newRoleTuples = participantConfig?.roles || [
            ["Ministro", 1],
            ["Catequista", 1],
            ["Coroinha", 1],
            ["Cantor", 1]
        ];
        
        setParticipantsByRole(
            newRoleTuples.reduce((acc: Record<string, string[]>, [role]: RoleTuple) => {
                acc[role] = participantsByRole[role] || [];
                return acc;
            }, {})
        );
    }, [selectedConfig]);

    // Calculate suggested dates when config or cron changes
    useEffect(() => {
        if (cronExpression) {
            // Call API to get next valid dates
            fetch('/api/cron/next-dates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cronExpression,
                    count: 10
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.dates) {
                    const dates = data.dates.map((dateStr: string) => new Date(dateStr));
                    setSuggestedDates(dates);
                }
            })
            .catch(error => {
                console.error('Erro ao buscar datas válidas:', error);
                setSuggestedDates([]);
            });
        } else {
            setSuggestedDates([]);
        }
    }, [cronExpression]);

    // Validate selected date against CRON
    useEffect(() => {
        if (date && time && cronExpression) {
            const selectedDateTime = new Date(`${date}T${time}`);
            // Check if selected date is near any suggested date
            const isValid = suggestedDates.some(suggestedDate => {
                const diff = Math.abs(suggestedDate.getTime() - selectedDateTime.getTime());
                return diff < 60000; // 1 minuto
            });
            
            if (isValid || suggestedDates.length === 0) {
                setDateValidationMessage('');
            } else {
                setDateValidationMessage('⚠️ Esta data/hora não corresponde ao padrão do agendamento selecionado, mas você pode salvar mesmo assim.');
            }
        } else {
            setDateValidationMessage('');
        }
    }, [date, time, cronExpression, suggestedDates]);

    // Toast for single mass creation
    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
                setTimeout(() => router.push('/dashboard/masses'), 1500);
            } else {
                toast.error(state.message);
            }
        }
    }, [state?.message, state?.success, router]);

    // Toast for multiple mass creation
    useEffect(() => {
        if (stateMulti?.message) {
            if (stateMulti.success) {
                toast.success(stateMulti.message);
                setTimeout(() => router.push('/dashboard/masses'), 1500);
            } else {
                toast.error(stateMulti.message);
            }
        }
    }, [stateMulti?.message, stateMulti?.success, router]);

    const handleConfigChange = (configId: string) => {
        setSelectedConfigId(configId);
        // Clear date/time when config changes
        setDate('');
        setTime('');
        setDateValidationMessage('');
    };

    const handleSuggestedDateClick = (suggestedDate: Date) => {
        const isSelected = selectedDates.some(d => d.getTime() === suggestedDate.getTime());

        if (isSelected) {
            // Remove from selection
            setSelectedDates(selectedDates.filter(d => d.getTime() !== suggestedDate.getTime()));
        } else {
            // Add to selection
            setSelectedDates([...selectedDates, suggestedDate]);
        }

        // Clear manual inputs
        setDate('');
        setTime('');
    };

    const handleManualDateChange = (newDate: string) => {
        setDate(newDate);
        if (selectedDates.length > 0) {
            setSelectedDates([]);
        }
    };

    const handleManualTimeChange = (newTime: string) => {
        setTime(newTime);
        if (selectedDates.length > 0) {
            setSelectedDates([]);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        // Add type and description
        formData.set('type', type);
        formData.set('description', description);

        // Add configId if selected
        if (selectedConfigId) {
            formData.set('configId', selectedConfigId);
        }

        // Add all participants for each role
        Object.entries(participantsByRole).forEach(([role, names]) => {
            names.forEach((name) => {
                if (name.trim() !== '') {
                    formData.append(`role_${role}`, name.trim());
                }
            });
        });

        // Handle MULTI-DATE or SINGLE-DATE submission
        if (selectedDates.length > 0) {
            // Multiple dates
            selectedDates.forEach((selectedDate) => {
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const hours = String(selectedDate.getHours()).padStart(2, '0');
                const minutes = String(selectedDate.getMinutes()).padStart(2, '0');

                const dateTimeString = combineLocalDateTime(
                    `${year}-${month}-${day}`,
                    `${hours}:${minutes}`
                );
                formData.append('dates', dateTimeString);
            });

            dispatchMulti(formData);
        } else if (date && time) {
            // Single date
            const dateTimeString = combineLocalDateTime(date, time);
            formData.set('date', dateTimeString);
            dispatch(formData);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6 max-w-2xl bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <input type="hidden" name="tenantId" value={tenant.id} />

            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Nova Missa</h2>
                <p className="text-sm text-gray-500">Preencha os dados para agendar uma nova missa</p>
            </div>

            {/* Config Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Configuração de Agendamento (Opcional)
                </label>
                <select
                    value={selectedConfigId}
                    onChange={(e) => handleConfigChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors"
                >
                    <option value="">Sem configuração</option>
                    {configs.map((config) => {
                        const cronConfig = config.cronConfig as { frequency?: string[] };
                        const frequencies = cronConfig?.frequency || [];
                        const cronExpr = frequencies.length > 0 ? frequencies[0] : '';
                        const description = cronExpr ? formatCronDescription(cronExpr) : 'Sem CRON';
                        
                        return (
                            <option key={config.id} value={config.id}>
                                {description}
                            </option>
                        );
                    })}
                </select>
                {selectedConfig && cronExpression && (
                    <p className="text-xs text-gray-500 mt-1">
                        Padrão: {formatCronDescription(cronExpression)}
                    </p>
                )}
            </div>

            {/* Date and Time */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Data
                        </label>
                        <DateInput
                            name="date"
                            value={date}
                            onChange={handleManualDateChange}
                            required={selectedDates.length === 0}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors"
                            placeholder="dd/MM/yyyy"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Hora
                        </label>
                        <TimeInput
                            name="time"
                            value={time}
                            onChange={handleManualTimeChange}
                            required={selectedDates.length === 0}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors"
                            placeholder="HH:mm"
                        />
                    </div>
                </div>

                {/* Type and Description */}
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Tipo <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent transition-colors"
                        >
                            <option value="Missa">Missa</option>
                            <option value="Encontro">Encontro</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Descrição <span className="text-red-500">*</span>
                        </label>
                        <RichTextEditor
                            name="description"
                            value={description}
                            onChange={setDescription}
                            required
                            rows={3}
                            className="w-full"
                            placeholder="Descreva a missa ou encontro..."
                        />
                    </div>
                </div>

                {/* Suggested Dates from CRON */}
                {suggestedDates.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Datas Sugeridas (baseadas no agendamento)
                        </label>
                        {selectedDates.length > 0 && (
                            <div className="mb-2 text-sm font-medium text-[#6d7749]">
                                {selectedDates.length} {selectedDates.length === 1 ? 'data selecionada' : 'datas selecionadas'}
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                            {suggestedDates.slice(0, 5).map((suggestedDate, index) => {
                                const isSelected = selectedDates.some(d => d.getTime() === suggestedDate.getTime());
                                const dateStr = suggestedDate.toLocaleDateString('pt-BR', {
                                    weekday: 'short',
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                });
                                const timeStr = suggestedDate.toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                });

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleSuggestedDateClick(suggestedDate)}
                                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                            isSelected
                                                ? 'bg-[#6d7749] text-white border-[#6d7749] hover:bg-[#5a6239]'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                        }`}
                                    >
                                        {dateStr} às {timeStr}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Validation Message */}
                {dateValidationMessage && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">{dateValidationMessage}</p>
                    </div>
                )}
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
                    disabled={isPending || isPendingMulti}
                >
                    {(isPending || isPendingMulti) ? 'Agendando...' : 'Agendar Missa'}
                </Button>
            </div>
        </form>
    );
}
