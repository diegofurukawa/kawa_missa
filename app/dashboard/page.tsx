import { getUpcomingMasses, getUserTenant, getLatestConfig } from '@/lib/data';
import MassCarousel from '@/app/ui/dashboard/mass-carousel';
import CatholicMessageBanner from '@/app/ui/dashboard/catholic-message-banner';
import ShareButton from '@/app/ui/share-button';
import { generateShareUrl } from '@/app/ui/share-url-generator';
import { auth } from '@/auth';

export default async function Dashboard() {
    const session = await auth();
    const isLoggedIn = !!session?.user;
    
    const tenant = await getUserTenant();
    const masses = tenant ? await getUpcomingMasses(tenant.id) : [];
    const config = tenant ? await getLatestConfig(tenant.id) : null;

    // Build the public dashboard URL for sharing
    const publicDashboardUrl = tenant 
        ? await generateShareUrl({ type: 'dashboard', tenantId: tenant.id })
        : null;

    return (
        <div className="w-full space-y-8">

            {/* Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {tenant?.denomination || tenant?.name || 'Bem-vindo!'}
                    </h1>
                    <p className="text-gray-600 mt-1.5">
                        {tenant?.responsibleName ? `Gestão: ${tenant.responsibleName}` : 'Complete o cadastro da sua organização para começar.'}
                    </p>
                </div>
                {tenant && publicDashboardUrl && (
                    <ShareButton 
                        url={publicDashboardUrl}
                        title={`${tenant.denomination || tenant.name} - Próximas Missas`}
                        text="Confira as próximas missas"
                        iconOnly={true}
                    />
                )}
            </div>

            {/* Carousel Section */}
            {tenant && (
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Próximas Missas (Semana)</h2>
                    <MassCarousel masses={masses} isLoggedIn={isLoggedIn} config={config} />
                </section>
            )}

            {/* Catholic Message Banner */}
            <section>
                <CatholicMessageBanner />
            </section>
        </div>
    );
}
