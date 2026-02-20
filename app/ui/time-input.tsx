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
 * Formata entrada do usuário para HH:mm
 * Aceita: "1330", "13:30", "13 30", etc.
 */
function formatTimeInput(input: string): string {
    // Remove tudo que não é número
    const numbers = input.replace(/\D/g, '');
    
    // Limita a 4 dígitos
    const limited = numbers.slice(0, 4);
    
    // Se tem menos de 4 dígitos, retorna como está (ainda digitando)
    if (limited.length < 4) {
        return limited;
    }
    
    // Formata como HH:mm
    return `${limited.slice(0, 2)}:${limited.slice(2, 4)}`;
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

    // Sincroniza displayValue com value prop
    useEffect(() => {
        setDisplayValue(value || '');
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        
        // Formata a entrada
        const formatted = formatTimeInput(inputValue);
        setDisplayValue(formatted);
        
        // Se tem 5 caracteres (HH:mm), valida e notifica
        if (formatted.length === 5 && validateTime(formatted)) {
            onChange(formatted);
        } else if (formatted.length === 0) {
            onChange('');
        }
    };

    const handleBlur = () => {
        // Ao sair do campo, valida
        if (displayValue.length === 5) {
            if (validateTime(displayValue)) {
                onChange(displayValue);
            } else {
                // Se inválido, limpa
                setDisplayValue('');
                onChange('');
            }
        } else if (displayValue.length > 0) {
            // Se tem valor mas não está completo, limpa
            setDisplayValue('');
            onChange('');
        }
    };

    return (
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
    );
}

