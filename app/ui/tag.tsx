'use client';

import { X } from 'lucide-react';
import clsx from 'clsx';

interface TagProps {
    children: React.ReactNode;
    onRemove?: () => void;
    variant?: 'default' | 'primary' | 'secondary' | 'tertiary';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Tag({ 
    children, 
    onRemove, 
    variant = 'default',
    size = 'md',
    className 
}: TagProps) {
    const baseStyles = 'inline-flex items-center gap-1.5 rounded-full border transition-colors';
    
    const variantStyles = {
        default: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
        primary: 'bg-[#6d7749]/10 text-[#6d7749] border-[#6d7749]/20 hover:bg-[#6d7749]/20',
        secondary: 'bg-[#6546b8]/10 text-[#6546b8] border-[#6546b8]/20 hover:bg-[#6546b8]/20',
        tertiary: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
    };
    
    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };
    
    return (
        <span
            className={clsx(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
        >
            <span>{children}</span>
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                    aria-label="Remover"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </span>
    );
}

