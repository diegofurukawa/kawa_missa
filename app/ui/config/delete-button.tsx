'use client';

import { useState } from 'react';
import { DeleteConfigModal } from './delete-modal';

export function DeleteConfigButton({ configId }: { configId: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
            >
                Excluir
            </button>

            <DeleteConfigModal
                configId={configId}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
