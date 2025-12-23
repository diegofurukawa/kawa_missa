'use client';

import { useState, useEffect, useRef } from 'react';

interface TimeInputProps {
    value: string; // HH:mm format (internal)
    onChange: (value: string) => void; // Returns HH:mm format
    name?: string;
    required?: boolean;
    className?: string;
    placeholder?: string;
}

/**
 * Valida formato HH:mm e valores
 */
function validateTime(timeStr: string): boolean {
    if (!timeStr) return false;
    
    const pattern = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
    return pattern.test(timeStr);
}

/**
 * Aplica máscara durante a digitação (HH:mm)
 */
function applyTimeMask(value: string): string {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 4 dígitos (HHmm)
    const limited = numbers.slice(0, 4);
    
    // Aplica a máscara
    if (limited.length === 0) return '';
    if (limited.length <= 2) return limited;
    return `${limited.slice(0, 2)}:${limited.slice(2)}`;
}

/**
 * Normaliza e valida o valor de hora
 */
function normalizeTime(value: string): string | null {
    if (!value) return null;
    
    // Remove caracteres não numéricos, exceto dois pontos
    const cleaned = value.replace(/[^\d:]/g, '');
    
    // Se não tem dois pontos, adiciona na posição correta
    if (!cleaned.includes(':')) {
        if (cleaned.length <= 2) return null;
        const withColon = `${cleaned.slice(0, 2)}:${cleaned.slice(2)}`;
        return validateTime(withColon) ? withColon : null;
    }
    
    const parts = cleaned.split(':');
    if (parts.length !== 2) return null;
    
    const hours = parts[0].padStart(2, '0');
    const minutes = parts[1].padStart(2, '0');
    
    // Validação de valores
    const hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);
    
    if (hoursNum < 0 || hoursNum > 23) return null;
    if (minutesNum < 0 || minutesNum > 59) return null;
    
    const formatted = `${hours}:${minutes}`;
    return validateTime(formatted) ? formatted : null;
}

export default function TimeInput({
    value,
    onChange,
    name,
    required = false,
    className = '',
    placeholder = 'HH:mm'
}: TimeInputProps) {
    const [displayValue, setDisplayValue] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Atualiza o valor de exibição quando o value prop muda
    useEffect(() => {
        if (value) {
            // O formato HH:mm já é o formato de exibição desejado
            setDisplayValue(value);
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        
        // Aplica máscara
        const masked = applyTimeMask(inputValue);
        setDisplayValue(masked);
        
        // Tenta normalizar e validar
        const normalized = normalizeTime(masked);
        
        // Se conseguiu normalizar (hora completa e válida), atualiza o valor interno
        if (normalized) {
            onChange(normalized);
        } else if (masked.length === 0) {
            // Se o campo está vazio, notifica o onChange com string vazia
            onChange('');
        }
    };

    const handleBlur = () => {
        // Na perda de foco, valida e corrige o valor se necessário
        const normalized = normalizeTime(displayValue);
        if (normalized) {
            setDisplayValue(normalized);
            onChange(normalized);
        } else if (displayValue && displayValue.length > 0) {
            // Se há valor mas não é válido, limpa
            setDisplayValue('');
            onChange('');
        }
    };

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                name={name}
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                required={required}
                placeholder={placeholder}
                maxLength={5}
                className={className}
                inputMode="numeric"
            />
            <input
                type="hidden"
                value={value || ''}
                name={name ? `${name}_internal` : undefined}
            />
        </div>
    );
}

