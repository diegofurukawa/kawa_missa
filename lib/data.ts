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
        take: 365
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
            take: 365
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

export async function getAllTenants() {
    try {
        const tenants = await prisma.tenant.findMany({
            select: {
                id: true,
                name: true,
                denomination: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        return tenants;
    } catch (error) {
        console.error('Erro ao buscar tenants:', error);
        return [];
    }
}
// --- USER DATA FETCHING ---

export async function getTenantUsers() {
    const session = await auth();
    if (!session?.user?.email) return [];

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { tenantId: true }
    });

    if (!user) return [];

    try {
        const users = await prisma.user.findMany({
            where: {
                tenantId: user.tenantId
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

export async function getUserById(id: string) {
    const session = await auth();
    if (!session?.user?.email) return null;

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { tenantId: true }
    });

    if (!currentUser) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                tenantId: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
            }
        });

        // Verify user belongs to same tenant
        if (user && user.tenantId !== currentUser.tenantId) {
            return null;
        }

        return user;
    } catch (error) {
        console.error('Failed to fetch user by id:', error);
        return null;
    }
}


// --- MASS FILTER DATA ---

export async function getMassDistinctWeekdays(tenantId: string): Promise<number[]> {
    try {
        const result = await prisma.$queryRaw<Array<{ weekday: number }>>`
            SELECT DISTINCT EXTRACT(DOW FROM ("date" - INTERVAL '3 hours')) AS weekday
            FROM "Mass"
            WHERE "tenantId" = ${tenantId}
            ORDER BY weekday ASC
        `;
        return result.map(r => Number(r.weekday)).sort((a, b) => a - b);
    } catch (error) {
        console.error('Failed to fetch distinct weekdays:', error);
        return [];
    }
}

export async function getMassDistinctTimes(tenantId: string): Promise<string[]> {
    try {
        const result = await prisma.$queryRaw<Array<{ time: string }>>`
            SELECT DISTINCT TO_CHAR("date" - INTERVAL '3 hours', 'HH24:MI') AS time
            FROM "Mass"
            WHERE "tenantId" = ${tenantId}
            ORDER BY time ASC
        `;
        return result.map(r => r.time).sort();
    } catch (error) {
        console.error('Failed to fetch distinct times:', error);
        return [];
    }
}
