'use client';

import { useSession } from 'next-auth/react';
import { Menu, User } from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { data: session, status } = useSession();
    const user = session?.user;
    const isLoading = status === 'loading';

    return (
        <header className="sticky top-0 z-40 flex h-14 md:h-16 items-center justify-between bg-white border-b border-gray-200 px-4 md:px-6 shadow-sm">
            {/* Mobile Menu Button */}
            <button
                onClick={onMenuClick}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
                aria-label="Abrir menu"
            >
                <Menu className="w-6 h-6 text-gray-700" />
            </button>

            {/* Mobile Logo - Centralizado */}
            <div className="md:hidden flex-1 flex items-center justify-center">
                <Image
                    src="/logo.jpeg"
                    alt="Logo"
                    width={36}
                    height={36}
                    className="rounded-full object-cover opacity-70"
                />
            </div>

            {/* Desktop Spacer */}
            <div className="hidden md:block w-64"></div>

            {/* User Info */}
            <div className="flex items-center gap-3 flex-1 md:flex-none justify-end">
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex flex-col items-end">
                        {isLoading ? (
                            <span className="text-sm text-gray-400">Carregando...</span>
                        ) : (
                            <>
                                <span className="text-sm font-medium text-gray-900">
                                    {user?.name || user?.email || 'Usuário'}
                                </span>
                                {user?.email && user?.name && (
                                    <span className="text-xs text-gray-500">{user.email}</span>
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#6d7749] text-white flex-shrink-0">
                        <User className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                </div>
            </div>
        </header>
    );
}

