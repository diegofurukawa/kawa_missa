import PublicHeader from '@/app/ui/dashboard/public-header';
import LoginModal from '@/app/ui/dashboard/login-modal';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#f6f5f8] flex flex-col">
            <PublicHeader />
            <main className="flex-1 md:p-6 lg:p-12 pb-12">
                {children}
            </main>
            <LoginModal />
        </div>
    );
}

