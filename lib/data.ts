import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getUserTenant() {
    const session = await auth();
    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            tenant: {
                include: {
                    address: true
                }
            }
        }
    });

    return user?.tenant || null;
}

export async function getUpcomingMasses(tenantId: string) {
    return await prisma.mass.findMany({
        where: {
            tenantId: tenantId,
            date: {
                gte: new Date(),
            }
        },
        include: {
            config: true
        },
        orderBy: {
            date: 'asc'
        },
        take: 7
    }).catch((error) => {
        // Fallback if config relation doesn't exist yet
        console.error('Error fetching masses with config:', error);
        return prisma.mass.findMany({
            where: {
                tenantId: tenantId,
                date: {
                    gte: new Date(),
                }
            },
            orderBy: {
                date: 'asc'
            },
            take: 7
        });
    });
}

export async function getConfigs(tenantId: string) {
    return await prisma.config.findMany({
        where: {
            tenantId: tenantId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export async function getLatestConfig(tenantId: string) {
    return await prisma.config.findFirst({
        where: {
            tenantId: tenantId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export async function getAllConfigs(tenantId: string) {
    return await prisma.config.findMany({
        where: {
            tenantId: tenantId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export async function getConfigById(id: string) {
    try {
        const config = await prisma.config.findUnique({
            where: { id }
        });
        return config;
    } catch (error) {
        console.error('Failed to fetch config by id:', error);
        return null;
    }
}

export async function getTenantBySlug(slug: string) {
    // For now, we'll use the tenant ID as the slug identifier
    // In the future, this could be extended to use a dedicated slug field
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: slug },
            include: {
                address: true
            }
        });
        return tenant;
    } catch (error) {
        console.error('Failed to fetch tenant by slug:', error);
        return null;
    }
}

export async function getMassById(id: string) {
    try {
        const mass = await prisma.mass.findUnique({
            where: { id },
            include: {
                config: true
            }
        });
        return mass;
    } catch (error) {
        console.error('Failed to fetch mass by id:', error);
        // Fallback without config relation
        try {
            return await prisma.mass.findUnique({
                where: { id }
            });
        } catch (fallbackError) {
            console.error('Fallback query also failed:', fallbackError);
            return null;
        }
    }
}
