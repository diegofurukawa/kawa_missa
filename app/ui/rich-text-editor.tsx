'use client';

import { useRef, useState, useEffect } from 'react';

interface RichTextEditorProps {
    name: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    rows?: number;
    className?: string;
    placeholder?: string;
}

export default function RichTextEditor({
    name,
    value,
    onChange,
    required = false,
    rows = 3,
    className = '',
    placeholder = ''
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            onChange(html);
        }
    };

    const execCommand = (command: string, value?: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
            handleInput();
        }
    };

    const isCommandActive = (command: string): boolean => {
        return document.queryCommandState(command);
    };

    return (
        <div className={`border border-gray-300 rounded-lg bg-white ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <button
                    type="button"
                    onClick={() => execCommand('bold')}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
                        isCommandActive('bold') ? 'bg-gray-300' : ''
                    }`}
                    title="Negrito (Ctrl+B)"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('italic')}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
                        isCommandActive('italic') ? 'bg-gray-300' : ''
                    }`}
                    title="Itálico (Ctrl+I)"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (editorRef.current) {
                            editorRef.current.focus();
                            const selection = window.getSelection();
                            if (selection && selection.rangeCount > 0) {
                                const range = selection.getRangeAt(0);
                                const selectedText = range.toString();
                                if (selectedText) {
                                    const p = document.createElement('p');
                                    p.style.textAlign = 'center';
                                    p.textContent = selectedText;
                                    range.deleteContents();
                                    range.insertNode(p);
                                } else {
                                    document.execCommand('formatBlock', false, 'p');
                                    const p = editorRef.current.querySelector('p:last-child');
                                    if (p) {
                                        (p as HTMLElement).style.textAlign = 'center';
                                    }
                                }
                            } else {
                                document.execCommand('formatBlock', false, 'p');
                                const p = editorRef.current.querySelector('p:last-child');
                                if (p) {
                                    (p as HTMLElement).style.textAlign = 'center';
                                }
                            }
                            handleInput();
                        }
                    }}
                    className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                    title="Centralizar"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`px-3 py-2 text-sm text-gray-900 focus:outline-none ${
                    isFocused ? 'ring-2 ring-[#6d7749]' : ''
                }`}
                style={{ minHeight: `${rows * 1.5}rem` }}
                data-placeholder={placeholder}
                suppressContentEditableWarning
            />

            {/* Hidden input for form submission */}
            <input type="hidden" name={name} value={value} required={required} />

            <style jsx global>{`
                div[contenteditable][data-placeholder]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                }
                div[contenteditable] p {
                    margin: 0;
                }
                div[contenteditable] p[style*="text-align: center"] {
                    text-align: center;
                }
            `}</style>
        </div>
    );
}

