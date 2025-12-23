import { getUserTenant, getAllConfigs, getMassById } from '@/lib/data';
import EditMassForm from '@/app/ui/masses/edit-form';
import ShareButton from '@/app/ui/share-button';
import { generateShareUrl } from '@/app/ui/share-url-generator';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

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

    const configsRaw = await getAllConfigs(tenant.id);

    // Convert Prisma JsonValue types to the expected Config type
    const configs = configsRaw.map(config => ({
        id: config.id,
        cronConfig: (config.cronConfig as { frequency?: string[] }) || { frequency: [] },
        participantConfig: (config.participantConfig as { roles?: [string, number][] }) || { roles: [] },
    }));

    // Build the public edit URL using ShareUrlGenerator
    const publicEditUrl = await generateShareUrl({ type: 'mass-edit', massId });

    // Convert mass to the format expected by EditMassForm
    const massForForm = {
        id: mass.id,
        slug: mass.slug,
        date: mass.date,
        type: (mass as any).type || 'Missa',
        description: (mass as any).description || '',
        participants: mass.participants as Record<string, string[]>,
        configId: mass.configId || null,
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
            <EditMassForm mass={massForForm} tenant={tenant} configs={configs} />
        </div>
    );
}

