'use client';

import { useState } from 'react';
import SideNav from '@/app/ui/dashboard/sidenav';
import Header from '@/app/ui/dashboard/header';
import Footer from '@/app/ui/dashboard/footer';

export default function Layout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#f6f5f8]">
            {/* Sidebar - Desktop: always visible, Mobile: drawer */}
            <div className="hidden md:block md:w-64 md:flex-shrink-0">
                <SideNav isOpen={true} onClose={() => {}} />
            </div>
            
            {/* Mobile Sidebar */}
            <div className="md:hidden">
                <SideNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Content - Scrollable */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-12 bg-[#f6f5f8]">
                    {children}
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
}
