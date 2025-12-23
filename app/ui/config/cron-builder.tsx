'use client';

import { useState, useEffect } from 'react';
import { Button } from '../button';

interface CronBuilderProps {
    value: string;
    onChange: (cronExpression: string) => void;
}

type FrequencyType = 'weekly' | 'monthly' | 'daily' | 'custom';
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Domingo, 6 = Sábado

const DAYS_OF_WEEK = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' },
];

export default function CronBuilder({ value, onChange }: CronBuilderProps) {
    const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
    const [frequency, setFrequency] = useState<FrequencyType>('weekly');
    const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([6]); // Default: Sábado
    const [hour, setHour] = useState<number>(19);
    const [minute, setMinute] = useState<number>(30);
    
    // Advanced mode fields
    const [advancedMinute, setAdvancedMinute] = useState<string>('30');
    const [advancedHour, setAdvancedHour] = useState<string>('19');
    const [advancedDay, setAdvancedDay] = useState<string>('*');
    const [advancedMonth, setAdvancedMonth] = useState<string>('*');
    const [advancedWeekday, setAdvancedWeekday] = useState<string>('6');

    // Parse existing CRON expression on mount
    useEffect(() => {
        if (value && value.trim() !== '') {
            parseCronExpression(value);
        }
    }, []);

    const parseCronExpression = (cronExpr: string) => {
        const parts = cronExpr.trim().split(/\s+/);
        if (parts.length !== 5) {
            // Invalid format, try to parse anyway or set to advanced mode
            setMode('advanced');
            if (parts.length >= 1) setAdvancedMinute(parts[0] || '30');
            if (parts.length >= 2) setAdvancedHour(parts[1] || '19');
            if (parts.length >= 3) setAdvancedDay(parts[2] || '*');
            if (parts.length >= 4) setAdvancedMonth(parts[3] || '*');
            if (parts.length >= 5) setAdvancedWeekday(parts[4] || '6');
            return;
        }

        const [min, hr, day, month, weekday] = parts;

        // Try to detect if it's a simple pattern
        if (day === '*' && month === '*') {
            setMode('simple');
            setAdvancedMinute(min);
            setAdvancedHour(hr);
            setAdvancedDay(day);
            setAdvancedMonth(month);
            setAdvancedWeekday(weekday);

            // Try to parse as weekly
            if (weekday !== '*' && !weekday.includes(',')) {
                const weekdayNum = parseInt(weekday);
                if (!isNaN(weekdayNum) && weekdayNum >= 0 && weekdayNum <= 6) {
                    setFrequency('weekly');
                    setSelectedDays([weekdayNum as DayOfWeek]);
                    setMinute(parseInt(min) || 30);
                    setHour(parseInt(hr) || 19);
                } else {
                    setMode('advanced');
                }
            } else {
                setMode('advanced');
            }
        } else {
            setMode('advanced');
            setAdvancedMinute(min);
            setAdvancedHour(hr);
            setAdvancedDay(day);
            setAdvancedMonth(month);
            setAdvancedWeekday(weekday);
        }
    };

    const generateCronExpression = (): string => {
        if (mode === 'advanced') {
            return `${advancedMinute} ${advancedHour} ${advancedDay} ${advancedMonth} ${advancedWeekday}`;
        }

        // Simple mode
        if (frequency === 'weekly') {
            const weekdays = selectedDays.length > 0 
                ? selectedDays.sort((a, b) => a - b).join(',')
                : '*';
            return `${minute} ${hour} * * ${weekdays}`;
        } else if (frequency === 'daily') {
            return `${minute} ${hour} * * *`;
        } else if (frequency === 'monthly') {
            // First day of month
            return `${minute} ${hour} 1 * *`;
        } else {
            // Custom - same as weekly for now
            const weekdays = selectedDays.length > 0 
                ? selectedDays.sort((a, b) => a - b).join(',')
                : '*';
            return `${minute} ${hour} * * ${weekdays}`;
        }
    };

    const handleCronChange = (newCron: string) => {
        onChange(newCron);
    };

    useEffect(() => {
        const cronExpr = generateCronExpression();
        handleCronChange(cronExpr);
    }, [mode, frequency, selectedDays, hour, minute, advancedMinute, advancedHour, advancedDay, advancedMonth, advancedWeekday]);

    const toggleDay = (day: DayOfWeek) => {
        setSelectedDays(prev => {
            if (prev.includes(day)) {
                return prev.filter(d => d !== day);
            } else {
                return [...prev, day].sort((a, b) => a - b);
            }
        });
    };

    const getCronDescription = (cronExpr: string): string => {
        const parts = cronExpr.trim().split(/\s+/);
        if (parts.length !== 5) return cronExpr;

        const [min, hr, day, month, weekday] = parts;
        
        if (mode === 'simple') {
            if (frequency === 'daily') {
                return `Todo dia às ${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
            } else if (frequency === 'weekly') {
                const dayNames = selectedDays.map(d => DAYS_OF_WEEK[d].label).join(', ');
                return `Toda(s) ${dayNames} às ${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
            } else if (frequency === 'monthly') {
                return `Todo dia 1 às ${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
            }
        }
        
        return cronExpr;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    Agendamento
                </label>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={mode === 'simple' ? 'primary' : 'secondary'}
                        onClick={() => setMode('simple')}
                        className="text-xs px-3 py-1"
                    >
                        Simples
                    </Button>
                    <Button
                        type="button"
                        variant={mode === 'advanced' ? 'primary' : 'secondary'}
                        onClick={() => setMode('advanced')}
                        className="text-xs px-3 py-1"
                    >
                        Avançado
                    </Button>
                </div>
            </div>

            {mode === 'simple' ? (
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Frequência
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setFrequency('daily')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    frequency === 'daily'
                                        ? 'bg-[#6d7749] text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                Todo dia
                            </button>
                            <button
                                type="button"
                                onClick={() => setFrequency('weekly')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    frequency === 'weekly'
                                        ? 'bg-[#6d7749] text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                Semanal
                            </button>
                            <button
                                type="button"
                                onClick={() => setFrequency('monthly')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    frequency === 'monthly'
                                        ? 'bg-[#6d7749] text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                Mensal
                            </button>
                            <button
                                type="button"
                                onClick={() => setFrequency('custom')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    frequency === 'custom'
                                        ? 'bg-[#6d7749] text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                Personalizado
                            </button>
                        </div>
                    </div>

                    {(frequency === 'weekly' || frequency === 'custom') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dias da Semana
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {DAYS_OF_WEEK.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => toggleDay(value as DayOfWeek)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            selectedDays.includes(value as DayOfWeek)
                                                ? 'bg-[#6d7749] text-white'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Hora
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="23"
                                value={hour}
                                onChange={(e) => setHour(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Minuto
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={minute}
                                onChange={(e) => setMinute(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Descrição:</p>
                        <p className="text-sm font-medium text-gray-900">
                            {getCronDescription(generateCronExpression())}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 font-mono">
                            {generateCronExpression()}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600 mb-4">
                        Formato CRON: minuto hora dia mês dia-da-semana
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Minuto (0-59)
                            </label>
                            <input
                                type="text"
                                value={advancedMinute}
                                onChange={(e) => setAdvancedMinute(e.target.value)}
                                placeholder="*"
                                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Hora (0-23)
                            </label>
                            <input
                                type="text"
                                value={advancedHour}
                                onChange={(e) => setAdvancedHour(e.target.value)}
                                placeholder="*"
                                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Dia (1-31)
                            </label>
                            <input
                                type="text"
                                value={advancedDay}
                                onChange={(e) => setAdvancedDay(e.target.value)}
                                placeholder="*"
                                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Mês (1-12)
                            </label>
                            <input
                                type="text"
                                value={advancedMonth}
                                onChange={(e) => setAdvancedMonth(e.target.value)}
                                placeholder="*"
                                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Dia Semana (0-6)
                            </label>
                            <input
                                type="text"
                                value={advancedWeekday}
                                onChange={(e) => setAdvancedWeekday(e.target.value)}
                                placeholder="*"
                                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6d7749] focus:border-transparent font-mono"
                            />
                        </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Expressão CRON:</p>
                        <p className="text-sm font-mono text-gray-900">
                            {generateCronExpression()}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

