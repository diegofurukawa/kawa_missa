'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LogIn } from 'lucide-react';

export default function PublicHeader() {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="flex items-center justify-between h-16 px-4 md:px-6">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <Image
                        src="/logo.jpeg"
                        alt="Logo"
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <span className="font-semibold text-gray-900 hidden md:block">
                        Kawa Missa
                    </span>
                </div>

                {/* Botão Login */}
                <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 bg-[#6d7749] text-white rounded-lg hover:bg-[#5d6541] transition-colors"
                >
                    <LogIn className="w-4 h-4" />
                    <span>Entrar</span>
                </Link>
            </div>
        </header>
    );
}
