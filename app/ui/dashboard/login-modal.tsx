'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogIn, X } from 'lucide-react';

export default function LoginModal() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Botão flutuante para abrir modal */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-[#6d7749] text-white rounded-full shadow-lg hover:bg-[#5d6541] transition-all hover:scale-105 active:scale-95"
                aria-label="Fazer login"
            >
                <LogIn className="w-5 h-5" />
                <span className="font-medium">Entrar</span>
            </button>

            {/* Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Botão fechar */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Fechar"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Conteúdo */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#6d7749]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogIn className="w-8 h-8 text-[#6d7749]" />
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Área Administrativa
                            </h2>

                            <p className="text-gray-600 mb-6">
                                Faça login para gerenciar as missas e configurações da sua paróquia
                            </p>

                            <div className="space-y-3">
                                <Link
                                    href="/login"
                                    className="block w-full px-6 py-3 bg-[#6d7749] text-white rounded-lg hover:bg-[#5d6541] transition-colors font-medium"
                                >
                                    Fazer Login
                                </Link>

                                <Link
                                    href="/onboarding"
                                    className="block w-full px-6 py-3 border-2 border-[#6d7749] text-[#6d7749] rounded-lg hover:bg-[#6d7749]/5 transition-colors font-medium"
                                >
                                    Cadastrar Paróquia
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
