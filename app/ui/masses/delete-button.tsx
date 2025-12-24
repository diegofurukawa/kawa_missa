'use client';

import { deleteMass } from '@/lib/actions';
import { toast } from 'sonner';
import { useState } from 'react';

export function DeleteMassButton({ massId }: { massId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir esta missa?')) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteMass(massId);

        if (result?.message) {
            toast.error(result.message);
        } else {
            toast.success('Missa excluída com sucesso!');
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
