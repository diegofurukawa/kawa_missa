import { getUserTenant, getLatestConfig, getMassById } from '@/lib/data';
import EditMassForm from '@/app/ui/masses/edit-form';
import ShareButton from '@/app/ui/share-button';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function EditMassPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    
    if (!session?.user?.email) {
        redirect('/login');
    }

    // Await params (Next.js 15+ requires params to be awaited)
    const { id: massId } = await params;

    const tenant = await getUserTenant();

    if (!tenant) {
        return <p>Organização não encontrada. Por favor, configure uma organização.</p>;
    }

    const mass = await getMassById(massId);

    if (!mass) {
        return (
            <div>
                <p>Missa não encontrada.</p>
                <Link href="/dashboard/masses" className="text-blue-500 hover:underline">
                    Voltar para Missas
                </Link>
            </div>
        );
    }

    // Verify the mass belongs to the user's tenant
    if (mass.tenantId !== tenant.id) {
        return (
            <div>
                <p>Você não tem permissão para editar esta missa.</p>
                <Link href="/dashboard/masses" className="text-blue-500 hover:underline">
                    Voltar para Missas
                </Link>
            </div>
        );
    }

    const config = await getLatestConfig(tenant.id);

    // Build the public edit URL using headers (for sharing without login)
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const publicEditUrl = `${protocol}://${host}/dashboard/public/masses/${massId}/edit`;

    // Convert mass to the format expected by EditMassForm
    const massForForm = {
        id: mass.id,
        slug: mass.slug,
        date: mass.date,
        participants: mass.participants as Record<string, string[]>,
    };

    return (
        <div className="w-full">
            <div className="mb-6 flex items-center justify-between">
                <Link href="/dashboard/masses" className="text-blue-500 hover:underline">
                    &larr; Voltar para Missas
                </Link>
                <ShareButton 
                    url={publicEditUrl}
                    title={`Editar Participantes - ${new Date(mass.date).toLocaleDateString('pt-BR')}`}
                    text="Compartilhe este link para editar os participantes da missa (sem necessidade de login)"
                />
            </div>
            <EditMassForm mass={massForForm} tenant={tenant} config={config} />
        </div>
    );
}

