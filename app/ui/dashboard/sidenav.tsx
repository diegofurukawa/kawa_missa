'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Home, Calendar, Settings, LogOut, Cog, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import Image from 'next/image';

const links = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Missas', href: '/dashboard/masses', icon: Calendar },
    { name: 'Organização', href: '/dashboard/organization', icon: Settings },
    { name: 'Configuração', href: '/dashboard/config', icon: Cog },
];

interface SideNavProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SideNav({ isOpen, onClose }: SideNavProps) {
    const pathname = usePathname();
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Close sidebar on route change (mobile only)
    useEffect(() => {
        if (isOpen && window.innerWidth < 768) {
            onClose();
        }
    }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle click outside and body scroll lock
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target as Node) &&
                // Don't close if clicking on the menu button (handled by parent)
                !(event.target as HTMLElement).closest('button[aria-label="Abrir menu"]')
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Prevent body scroll when sidebar is open on mobile
            if (window.innerWidth < 768) {
                document.body.style.overflow = 'hidden';
            }
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={clsx(
                    'fixed md:static inset-y-0 left-0 z-50 flex h-full w-64 flex-col px-3 py-4 md:px-2 bg-[#f6f5f8] border-r border-gray-200 transition-transform duration-300 ease-in-out overflow-hidden',
                    {
                        'translate-x-0': isOpen,
                        '-translate-x-full': !isOpen,
                    },
                    'md:translate-x-0'
                )}
            >
                {/* Close button for mobile */}
                <div className="flex items-center justify-between mb-2 md:mb-0 flex-shrink-0">
                    <Link
                        className="flex h-20 items-center justify-center gap-3 rounded-lg bg-[#6d7749] p-4 md:h-40 hover:bg-[#5d6541] transition-colors flex-1 min-w-0"
                        href="/"
                        onClick={() => {
                            // Close sidebar on mobile when clicking logo
                            if (window.innerWidth < 768) {
                                onClose();
                            }
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <Image
                                src="/logo.jpeg"
                                alt="Kawa Missa Logo"
                                width={48}
                                height={48}
                                className="rounded-full object-cover border-2 border-white/30 shrink-0"
                            />
                            <div className="text-white font-bold text-xl truncate hidden md:block">
                                Kawa Missa
                            </div>
                        </div>
                    </Link>
                    <button
                        onClick={onClose}
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-200 transition-colors text-gray-700 flex-shrink-0 ml-2"
                        aria-label="Fechar menu"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-1 flex-col space-y-2 min-h-0 overflow-y-auto">
                    {links.map((link) => {
                        const LinkIcon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => {
                                    // Close sidebar on mobile when clicking a link
                                    if (window.innerWidth < 768) {
                                        onClose();
                                    }
                                }}
                                className={clsx(
                                    'flex h-[48px] items-center gap-2 rounded-lg p-3 text-sm font-medium transition-colors md:justify-start md:p-2 md:px-3 flex-shrink-0',
                                    {
                                        'bg-[#6d7749]/10 text-[#6d7749]': isActive,
                                        'bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900': !isActive,
                                    },
                                )}
                            >
                                <LinkIcon className="w-6 flex-shrink-0" />
                                <p className="hidden md:block">{link.name}</p>
                            </Link>
                        );
                    })}
                    
                    {/* Spacer to push logout to bottom */}
                    <div className="flex-1 min-h-[20px]"></div>
                    
                    {/* Logout button - fixed at bottom */}
                    <button
                        className="flex h-[48px] items-center gap-2 rounded-lg bg-white p-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors md:justify-start md:p-2 md:px-3 flex-shrink-0 mt-auto"
                        onClick={() => signOut({ callbackUrl: '/login', redirect: true })}
                    >
                        <LogOut className="w-6 flex-shrink-0" />
                        <div className="hidden md:block">Sign Out</div>
                    </button>
                </div>
            </div>
        </>
    );
}
