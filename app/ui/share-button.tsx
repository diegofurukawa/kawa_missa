'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './button';

interface ShareButtonProps {
    url: string;
    title?: string;
    text?: string;
    className?: string;
    iconOnly?: boolean;
}

export default function ShareButton({ url, title, text, className, iconOnly = false }: ShareButtonProps) {
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async () => {
        setIsSharing(true);

        try {
            // Check if Web Share API is available (mobile devices)
            if (navigator.share) {
                await navigator.share({
                    title: title || 'Compartilhar',
                    text: text || 'Confira este link',
                    url: url,
                });
                toast.success('Link compartilhado com sucesso!');
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(url);
                toast.success('Link copiado para a área de transferência!');
            }
        } catch (error: any) {
            // User cancelled the share dialog
            if (error.name !== 'AbortError') {
                // If clipboard API fails, try fallback method
                try {
                    const textArea = document.createElement('textarea');
                    textArea.value = url;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    toast.success('Link copiado para a área de transferência!');
                } catch (fallbackError) {
                    toast.error('Erro ao compartilhar. Por favor, copie o link manualmente.');
                }
            }
        } finally {
            setIsSharing(false);
        }
    };

    if (iconOnly) {
        return (
            <button
                onClick={handleShare}
                disabled={isSharing}
                className={`p-2 rounded-lg bg-[#6546b8] hover:bg-[#563a9d] text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#6546b8] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
                aria-label="Compartilhar"
            >
                {isSharing ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                )}
            </button>
        );
    }

    return (
        <Button
            onClick={handleShare}
            disabled={isSharing}
            variant="secondary"
            size="md"
            className={className}
        >
            {isSharing ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Compartilhando...
                </>
            ) : (
                <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Compartilhar
                </>
            )}
        </Button>
    );
}

