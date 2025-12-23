'use client';

import { updateMass } from '@/lib/actions';
import { useActionState } from 'react';
import { toast } from 'sonner';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '../button';
import { TagInput } from '../tag-input';
import DateInput from '../date-input';
import TimeInput from '../time-input';
import RichTextEditor from '../rich-text-editor';
import { formatLocalDateTime, combineLocalDateTime } from '@/lib/date-utils';
import { formatCronDescription } from '@/lib/cron-utils';

type RoleTuple = [string, number];

interface Mass {
    id: string;
    slug: string;
    date: Date;
    type?: string;
    description?: string;
    participants: Record<string, string[]>;
    configId?: string | null;
}

interface Config {
    id: string;
    cronConfig: { frequency?: string[] };
    participantConfig: { roles?: RoleTuple[] };
}

export default function EditMassForm({ mass, tenant, configs }: { mass: Mass; tenant: any; configs: Config[] }) {
    const updateMassWithId = async (prevState: any, formData: FormData) => {
        return await updateMass(mass.id, prevState, formData);
    };
    
    const [state, dispatch, isPending] = useActionState(updateMassWithId, undefined);

    // State for selected config (initialize with mass.configId if exists)
    const [selectedConfigId, setSelectedConfigId] = useState<string>(mass.configId || '');
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

    // Initialize state with existing mass data
    const [participantsByRole, setParticipantsByRole] = useState<Record<string, string[]>>(
        roleTuples.reduce((acc: Record<string, string[]>, [role]: RoleTuple) => {
            acc[role] = mass.participants[role] || [];
            return acc;
        }, {})
    );

    // Initialize date and time from existing mass (convert from UTC to local)
    const massDate = new Date(mass.date);
    const { date: initialDate, time: initialTime } = formatLocalDateTime(massDate);
    const [date, setDate] = useState<string>(initialDate);
    const [time, setTime] = useState<string>(initialTime);

    // Initialize type and description from existing mass
    const [type, setType] = useState<string>(mass.type || 'Missa');
    const [description, setDescription] = useState<string>(mass.description || '');

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

    useEffect(() => {
        if (state?.message) {
            toast.error(state.message);
        }
    }, [state?.message]);

    const handleConfigChange = (configId: string) => {
        setSelectedConfigId(configId);
        setDateValidationMessage('');
    };

    const handleSuggestedDateClick = (suggestedDate: Date) => {
        const year = suggestedDate.getFullYear();
        const month = String(suggestedDate.getMonth() + 1).padStart(2, '0');
        const day = String(suggestedDate.getDate()).padStart(2, '0');
        const hours = String(suggestedDate.getHours()).padStart(2, '0');
        const minutes = String(suggestedDate.getMinutes()).padStart(2, '0');
        
        setDate(`${year}-${month}-${day}`);
        setTime(`${hours}:${minutes}`);
    };

    const handleSubmit = async (formData: FormData) => {
        // Combine date and time into ISO datetime string (local, no timezone)
        if (date && time) {
            const dateTimeString = combineLocalDateTime(date, time);
            formData.set('date', dateTimeString);
        }

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
        
        dispatch(formData);
    };

    return (
        <form action={handleSubmit} className="space-y-6 max-w-2xl bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <input type="hidden" name="tenantId" value={tenant.id} />

            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Editar Missa</h2>
                <p className="text-sm text-gray-500">Atualize os dados da missa</p>
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

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Data
                        </label>
                        <DateInput 
                            name="date" 
                            value={date}
                            onChange={setDate}
                            required 
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
                            onChange={setTime}
                            required 
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
                        <div className="flex flex-wrap gap-2">
                            {suggestedDates.slice(0, 5).map((suggestedDate, index) => {
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
                                        className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition-colors"
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
                    disabled={isPending}
                >
                    {isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>
        </form>
    );
}
