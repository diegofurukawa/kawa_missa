'use client';

interface PrintButtonProps {
    label?: string;
}

export default function PrintButton({ label = 'Abrir impressao' }: PrintButtonProps) {
    return (
        <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-[#6d7749] px-4 py-2 text-sm font-medium text-white hover:bg-[#5d6541]"
        >
            {label}
        </button>
    );
}
