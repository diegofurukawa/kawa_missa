'use client';

import { useState } from 'react';
import { DeleteMassModal } from './delete-modal';

interface DeleteMassButtonProps {
    massId: string;
    massLabel?: string;
}

export function DeleteMassButton({ massId, massLabel = 'esta missa' }: DeleteMassButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
            >
                Excluir
            </button>
            <DeleteMassModal
                massId={massId}
                massLabel={massLabel}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
