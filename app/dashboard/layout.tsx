import { auth } from '@/auth';
import DashboardLayoutClient from '@/app/ui/dashboard/dashboard-layout-client';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const isLoggedIn = !!session?.user;

    return (
        <DashboardLayoutClient isLoggedIn={isLoggedIn}>
            {children}
        </DashboardLayoutClient>
    );
}
