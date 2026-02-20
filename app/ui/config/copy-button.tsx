'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { copyConfig } from '@/lib/actions';

interface CopyConfigButtonProps {
  configId: string;
}

export function CopyConfigButton({ configId }: CopyConfigButtonProps) {
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      const result = await copyConfig(configId);
      if (result.success) {
        toast.success('Configuração copiada com sucesso!');
      } else {
        toast.error(result.message || 'Erro ao copiar configuração');
      }
    } catch (error) {
      toast.error('Erro ao copiar configuração');
      console.error('Copy error:', error);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={isCopying}
      className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors disabled:opacity-50"
      title="Copiar esta configuração"
    >
      {isCopying ? 'Copiando...' : 'Copiar'}
    </button>
  );
}
