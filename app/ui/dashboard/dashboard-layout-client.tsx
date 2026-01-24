'use client';

import { useState } from 'react';
import SideNav from '@/app/ui/dashboard/sidenav';
import Header from '@/app/ui/dashboard/header';
import Footer from '@/app/ui/dashboard/footer';

interface DashboardLayoutClientProps {
    children: React.ReactNode;
    isLoggedIn: boolean;
}

export default function DashboardLayoutClient({ children, isLoggedIn }: DashboardLayoutClientProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#f6f5f8]">
            {/* Sidebar - Only render if logged in */}
            {isLoggedIn && (
                <>
                    {/* Desktop Sidebar */}
                    <div className="hidden md:block md:w-64 md:flex-shrink-0">
                        <SideNav isOpen={true} onClose={() => {}} />
                    </div>

                    {/* Mobile Sidebar */}
                    <div className="md:hidden">
                        <SideNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                    </div>
                </>
            )}

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Header - Only render if logged in */}
                {isLoggedIn && <Header onMenuClick={() => setSidebarOpen(true)} />}

                {/* Content - Scrollable */}
                <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-12 bg-[#f6f5f8] ${!isLoggedIn ? 'pb-32 md:pb-4' : ''}`}>
                    {children}
                </main>

                {/* Footer - Only render if logged in */}
                {isLoggedIn && <Footer />}
            </div>
        </div>
    );
}
