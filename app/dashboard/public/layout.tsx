import PublicHeader from '@/app/ui/dashboard/public-header';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#f6f5f8] flex flex-col">
            <PublicHeader />
            <main className="flex-1 md:p-6 lg:p-12 pb-32 md:pb-12">
                {children}
            </main>
        </div>
    );
}

