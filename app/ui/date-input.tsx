'use client';

import { useState, useEffect, useRef } from 'react';

interface DateInputProps {
    value: string; // YYYY-MM-DD format (internal)
    onChange: (value: string) => void; // Returns YYYY-MM-DD format
    name?: string;
    required?: boolean;
    className?: string;
    placeholder?: string;
}

/**
 * Converte YYYY-MM-DD para dd/MM/yyyy
 */
function formatDateToBR(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return '';
    return `${day}/${month}/${year}`;
}

/**
 * Converte dd/MM/yyyy para YYYY-MM-DD
 */
function parseDateFromBR(brDateStr: string): string | null {
    if (!brDateStr) return null;
    
    // Remove caracteres não numéricos, exceto barras
    const cleaned = brDateStr.replace(/[^\d/]/g, '');
    const parts = cleaned.split('/').filter(Boolean);
    
    if (parts.length === 0) return null;
    
    // Se só tem números, vamos tentar montar a data
    if (parts.length === 1) {
        const digits = parts[0];
        // Não temos informação suficiente
        if (digits.length < 2) return null;
    }
    
    if (parts.length < 3) return null;
    
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    
    // Validação básica
    if (day.length !== 2 || month.length !== 2 || year.length !== 4) {
        return null;
    }
    
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    // Validação de valores
    if (monthNum < 1 || monthNum > 12) return null;
    if (dayNum < 1 || dayNum > 31) return null;
    if (yearNum < 1900 || yearNum > 2100) return null;
    
    // Validar se a data é válida (ex: 31/02 não existe)
    const date = new Date(yearNum, monthNum - 1, dayNum);
    if (
        date.getFullYear() !== yearNum ||
        date.getMonth() !== monthNum - 1 ||
        date.getDate() !== dayNum
    ) {
        return null;
    }
    
    return `${year}-${month}-${day}`;
}

/**
 * Aplica máscara durante a digitação (dd/MM/yyyy)
 */
function applyDateMask(value: string): string {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 8 dígitos (ddMMyyyy)
    const limited = numbers.slice(0, 8);
    
    // Aplica a máscara
    if (limited.length === 0) return '';
    if (limited.length <= 2) return limited;
    if (limited.length <= 4) return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
}

export default function DateInput({
    value,
    onChange,
    name,
    required = false,
    className = '',
    placeholder = 'dd/MM/yyyy'
}: DateInputProps) {
    const [displayValue, setDisplayValue] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Atualiza o valor de exibição quando o value prop muda
    useEffect(() => {
        if (value) {
            const brFormat = formatDateToBR(value);
            setDisplayValue(brFormat);
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        
        // Aplica máscara
        const masked = applyDateMask(inputValue);
        setDisplayValue(masked);
        
        // Tenta parsear para o formato interno
        const parsed = parseDateFromBR(masked);
        
        // Se conseguiu parsear (data completa e válida), atualiza o valor interno
        if (parsed) {
            onChange(parsed);
        } else if (masked.length === 0) {
            // Se o campo está vazio, notifica o onChange com string vazia
            onChange('');
        }
    };

    const handleBlur = () => {
        // Na perda de foco, valida e corrige o valor se necessário
        const parsed = parseDateFromBR(displayValue);
        if (parsed) {
            // Garante que está formatado corretamente
            const brFormat = formatDateToBR(parsed);
            setDisplayValue(brFormat);
            onChange(parsed);
        } else if (displayValue && displayValue.length > 0) {
            // Se há valor mas não é válido, tenta limpar ou manter formato visual
            // Não atualiza o onChange se não for válido
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
                maxLength={10}
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

