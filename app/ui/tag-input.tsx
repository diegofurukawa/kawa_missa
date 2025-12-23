'use client';

import { useState, KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
import { Tag } from './tag';
import clsx from 'clsx';

interface TagInputProps {
    tags: string[];
    onTagsChange: (tags: string[]) => void;
    placeholder?: string;
    label?: string;
    className?: string;
    maxTags?: number;
    allowDuplicates?: boolean;
}

export function TagInput({
    tags,
    onTagsChange,
    placeholder = 'Digite e pressione Enter',
    label,
    className,
    maxTags,
    allowDuplicates = false,
}: TagInputProps) {
    const [inputValue, setInputValue] = useState('');

    const handleAddTag = () => {
        const trimmedValue = inputValue.trim();
        
        if (!trimmedValue) return;
        
        if (maxTags && tags.length >= maxTags) {
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
        onTagsChange(tags.filter((_, index) => index !== indexToRemove));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            handleRemoveTag(tags.length - 1);
        }
    };

    return (
        <div className={clsx('space-y-2', className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
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
                
                <div className="flex items-center gap-1 flex-1 min-w-[120px]">
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
                        disabled={!inputValue.trim() || (maxTags ? tags.length >= maxTags : false)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 hover:text-gray-700"
                        aria-label="Adicionar tag"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>
            
            {maxTags && (
                <p className="text-xs text-gray-500">
                    {tags.length} / {maxTags} tags
                </p>
            )}
        </div>
    );
}

