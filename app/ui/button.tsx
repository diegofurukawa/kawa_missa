import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'form-primary' | 'form-secondary' | 'default';
    size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
    children, 
    className, 
    variant = 'default',
    size = 'md',
    ...rest 
}: ButtonProps) {
    const baseStyles = 'flex items-center justify-center rounded-lg font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] aria-disabled:cursor-not-allowed aria-disabled:opacity-50';
    
    const variantStyles = {
        default: 'bg-blue-500 hover:bg-blue-600 focus-visible:outline-blue-500',
        primary: 'bg-[#6d7749] hover:bg-[#5d6541] focus-visible:outline-[#6d7749]',
        secondary: 'bg-[#6546b8] hover:bg-[#563a9d] focus-visible:outline-[#6546b8]',
        tertiary: 'bg-blue-500 hover:bg-blue-600 focus-visible:outline-blue-500',
        'form-primary': 'bg-[#6d7749] hover:bg-[#5d6541] focus-visible:outline-[#6d7749]',
        'form-secondary': 'bg-[#6546b8] hover:bg-[#563a9d] focus-visible:outline-[#6546b8]',
    };
    
    const sizeStyles = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
    };
    
    return (
        <button
            {...rest}
            className={clsx(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                className,
            )}
        >
            {children}
        </button>
    );
}
