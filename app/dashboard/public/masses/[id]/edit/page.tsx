import { getMassById, getLatestConfig } from '@/lib/data';
import EditParticipantsPage from '@/app/ui/masses/edit-participants-page';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

export default async function PublicEditMassPage({ params }: { params: Promise<{ id: string }> }) {
    // Await params (Next.js 15+ requires params to be awaited)
    const { id: massId } = await params;

    const mass = await getMassById(massId);

    if (!mass) {
        notFound();
    }

    // Get config from the mass's tenant
    const config = await getLatestConfig(mass.tenantId);

    // Build the public edit URL using headers
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const publicEditUrl = `${protocol}://${host}/dashboard/public/masses/${massId}/edit`;

    // Convert mass to the format expected by EditParticipantsPage
    const massForForm = {
        id: mass.id,
        slug: mass.slug,
        date: mass.date,
        participants: mass.participants as Record<string, string[]>,
    };

    return (
        <div className="w-full min-h-screen bg-[#f6f5f8] p-4 md:p-6 lg:p-12">
            <div className="max-w-2xl mx-auto">
                <EditParticipantsPage 
                    mass={massForForm} 
                    config={config} 
                    shareUrl={publicEditUrl}
                />
            </div>
        </div>
    );
}

