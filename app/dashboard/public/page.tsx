import type { Metadata } from "next";
import { getTenantBySlug, getUpcomingMasses, getLatestConfig } from '@/lib/data';
import MassCarousel from '@/app/ui/dashboard/mass-carousel';
import ShareButton from '@/app/ui/share-button';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const tenantSlug = resolvedSearchParams.tenant;

  if (!tenantSlug) {
    return {
      title: "Consulta de Missas",
      description: "Plataforma para consulta de horários de missas",
    };
  }

  try {
    const tenant = await getTenantBySlug(tenantSlug);

    if (!tenant) {
      return {
        title: "Paróquia não encontrada",
        description: "A paróquia solicitada não foi encontrada",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = `${tenant.denomination || tenant.name} - Próximas Missas`;
    const description = tenant.responsibleName
      ? `Consulte os horários das próximas missas - ${tenant.responsibleName}`
      : `Consulte os horários das próximas missas de ${tenant.denomination || tenant.name}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        locale: "pt_BR",
        url: `/dashboard/public?tenant=${tenantSlug}`,
        siteName: "Kawa Missa",
        images: [
          {
            url: "/og-image-public.png",
            width: 1200,
            height: 630,
            alt: tenant.denomination || tenant.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ["/og-image-public.png"],
      },
      alternates: {
        canonical: `/dashboard/public?tenant=${tenantSlug}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Erro ao carregar paróquia",
      description: "Plataforma para consulta de horários de missas",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function PublicDashboardPage({ searchParams }: { searchParams: Promise<{ tenant?: string }> }) {
    const resolvedSearchParams = await searchParams;
    const tenantSlug = resolvedSearchParams.tenant;

    if (!tenantSlug) {
        return (
            <div className="w-full flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-gray-500">Por favor, forneça um identificador de organização.</p>
                    <p className="text-sm text-gray-400 mt-2">Use: /dashboard/public?tenant=ID_DA_ORGANIZACAO</p>
                </div>
            </div>
        );
    }

    const tenant = await getTenantBySlug(tenantSlug);

    if (!tenant) {
        notFound();
    }

    const masses = await getUpcomingMasses(tenant.id);
    const config = await getLatestConfig(tenant.id);

    // Build the public URL using headers
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const publicUrl = `${protocol}://${host}/dashboard/public?tenant=${tenantSlug}`;

    return (
        <div className="w-full space-y-8 p-4 md:p-6 lg:p-12">
            {/* Minimalist Header */}
            <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {tenant.denomination || tenant.name}
                    </h1>
                    <ShareButton 
                        url={publicUrl}
                        title={`${tenant.denomination || tenant.name} - Próximas Missas`}
                        text="Confira as próximas missas"
                    />
                </div>
                {tenant.responsibleName && (
                    <p className="text-gray-600 mt-1.5">
                        {tenant.responsibleName}
                    </p>
                )}
            </div>

            {/* Carousel Section */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">Próximas Missas</h2>
                <MassCarousel masses={masses} isLoggedIn={false} config={config} />
            </section>
        </div>
    );
}

