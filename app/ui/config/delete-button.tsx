'use client';

import { deleteConfig } from '@/lib/actions';
import { toast } from 'sonner';
import { useState } from 'react';

export function DeleteConfigButton({ configId }: { configId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir esta configuração?')) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteConfig(configId);

        if (result?.success) {
            toast.success(result.message || 'Configuração excluída com sucesso!');
        } else if (result?.message) {
            toast.error(result.message);
        }
        setIsDeleting(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors disabled:opacity-50"
        >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
        </button>
    );
}
