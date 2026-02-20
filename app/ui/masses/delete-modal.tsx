'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { deleteMass } from '@/lib/actions';

interface DeleteMassModalProps {
  massId: string;
  massLabel: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteMassModal({
  massId,
  massLabel,
  isOpen,
  onClose,
}: DeleteMassModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteMass(massId);
      if (result.success) {
        toast.success('Missa excluída com sucesso!');
        onClose();
      } else {
        toast.error(result.message || 'Erro ao excluir missa');
      }
    } catch (error) {
      toast.error('Erro ao excluir missa');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c0 .866.217 1.694.648 2.405L1.29 19.577a.75.75 0 001.06 1.06l3.894-3.894c.11.02.223.039.336.039h15.62a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5H2.75a1.5 1.5 0 00-1.5 1.5v10.5z"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 id="delete-modal-title" className="text-lg font-semibold text-gray-900">
              Confirmar Exclusão
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Tem certeza que deseja excluir a missa de <strong>{massLabel}</strong>?
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}
