'use client';

import { useState, KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
import { Tag } from './tag';
import clsx from 'clsx';
import { toast } from 'sonner';

interface TagInputProps {
    tags: string[];
    onTagsChange: (tags: string[]) => void;
    placeholder?: string;
    label?: string;
    className?: string;
    maxTags?: number;
    allowDuplicates?: boolean;
    canRemove?: boolean;
    saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
    onMaxTagsReached?: () => void;
}

export function TagInput({
    tags,
    onTagsChange,
    placeholder = 'Digite e pressione Enter',
    label,
    className,
    maxTags,
    allowDuplicates = false,
    canRemove = true,
    saveStatus = 'idle',
    onMaxTagsReached,
}: TagInputProps) {
    const [inputValue, setInputValue] = useState('');

    const handleAddTag = () => {
        const trimmedValue = inputValue.trim();

        if (!trimmedValue) return;

        if (maxTags && tags.length >= maxTags) {
            toast.info('Todas as vagas foram preenchidas!');
            setInputValue('');
            onMaxTagsReached?.();
            return;
        }

        if (!allowDuplicates && tags.includes(trimmedValue)) {
            setInputValue('');
            return;
        }

        onTagsChange([...tags, trimmedValue]);
        setInputValue('');
    };

    const handleRemoveTag = (indexToRemove: number) => {
        if (!canRemove) {
            toast.info('Para retirar o nome, necessário solicitar ao responsável!');
            return;
        }
        onTagsChange(tags.filter((_, index) => index !== indexToRemove));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (maxTags && tags.length >= maxTags) return;
            handleAddTag();
        } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            handleRemoveTag(tags.length - 1);
        }
    };

    return (
        <div className={clsx('space-y-2', className)}>
            {label && (
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                    {saveStatus !== 'idle' && (
                        <div className="text-xs">
                            {saveStatus === 'saving' && (
                                <span className="text-gray-500 flex items-center gap-1">
                                    <span className="inline-block w-3 h-3 bg-gray-400 rounded-full animate-pulse"></span>
                                    Salvando...
                                </span>
                            )}
                            {saveStatus === 'saved' && (
                                <span className="text-green-600 flex items-center gap-1">
                                    ✓ Salvo
                                </span>
                            )}
                            {saveStatus === 'error' && (
                                <span className="text-red-600 flex items-center gap-1">
                                    ✗ Erro
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-wrap gap-2 p-2.5 min-h-[42px] border border-gray-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-[#6d7749] focus-within:border-[#6d7749] transition-colors">
                {tags.map((tag, index) => (
                    <Tag
                        key={index}
                        onRemove={() => handleRemoveTag(index)}
                        size="sm"
                    >
                        {tag}
                    </Tag>
                ))}

                <div className="flex items-center gap-1 w-full mt-1">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={tags.length === 0 ? placeholder : ''}
                        className="flex-1 outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-transparent"
                        disabled={maxTags ? tags.length >= maxTags : false}
                    />
                    <button
                        type="button"
                        onClick={handleAddTag}
                        disabled={!inputValue.trim()}
                        className={clsx(
                            'p-1.5 rounded-full transition-all duration-200 shrink-0',
                            'disabled:opacity-30 disabled:cursor-not-allowed',
                            'enabled:bg-[#6d7749] enabled:text-white enabled:hover:bg-[#5d6541]',
                            'enabled:shadow-md enabled:hover:shadow-lg',
                            'enabled:animate-pulse enabled:hover:animate-none',
                            'font-bold'
                        )}
                        aria-label="Adicionar participante"
                        title="Clique para adicionar"
                    >
                        <Plus className="h-5 w-5 stroke-3" />
                    </button>
                </div>
            </div>

            {maxTags && (
                <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                        {tags.length} / {maxTags} tags
                    </p>
                    {tags.length >= maxTags && (
                        <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            Todas as vagas foram preenchidas para esta função.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

