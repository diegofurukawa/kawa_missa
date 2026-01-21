'use client';

import Image from 'next/image';

export default function PublicHeader() {
    return (
        <header className="bg-white border-b border-gray-200">
            <div className="flex items-center justify-center h-16 px-4 md:px-6">
                {/* Logo centralizado */}
                <div className="flex items-center gap-3">
                    <Image
                        src="/logo.jpeg"
                        alt="Logo"
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <span className="font-semibold text-gray-900 text-lg">
                        Kawa Missa
                    </span>
                </div>
            </div>
        </header>
    );
}
