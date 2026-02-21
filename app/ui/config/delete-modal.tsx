'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { deleteConfig } from '@/lib/actions';

interface DeleteConfigModalProps {
  configId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteConfigModal({
  configId,
  isOpen,
  onClose,
}: DeleteConfigModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteConfig(configId);
      if (result?.success) {
        toast.success(result.message || 'Configuração excluída com sucesso!');
        onClose();
      } else {
        toast.error(result?.message || 'Erro ao excluir configuração');
      }
    } catch (error) {
      toast.error('Erro ao excluir configuração');
      console.error('Delete config error:', error);
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
      aria-labelledby="delete-config-modal-title"
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
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 id="delete-config-modal-title" className="text-lg font-semibold text-gray-900">
              Confirmar Exclusão
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Tem certeza que deseja excluir esta configuração? Esta ação não pode ser desfeita.
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
