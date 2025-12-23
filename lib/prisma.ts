import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Build DATABASE_URL from individual variables if needed
function getDatabaseUrl(): string {
    const dbUrl = process.env.DATABASE_URL;
    
    // If DATABASE_URL is set and doesn't contain placeholders, use it
    if (dbUrl && !dbUrl.includes('${') && !dbUrl.includes('host_database')) {
        return dbUrl;
    }
    
    // Otherwise, build from individual variables
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'kawa_missa';
    const dbSchema = process.env.DB_SCHEMA || 'public';
    
    // Validate that we have at least the essential variables
    if (!dbHost || dbHost === 'host_database') {
        console.error('[Prisma] DB_HOST:', dbHost);
        console.error('[Prisma] DB_USER:', dbUser);
        console.error('[Prisma] DB_NAME:', dbName);
        throw new Error('DB_HOST não está configurado corretamente. Verifique suas variáveis de ambiente.');
    }
    
    const url = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=${dbSchema}`;
    
    // Debug: log connection string (without password for security)
    if (process.env.NODE_ENV === 'development') {
        const safeUrl = url.replace(/:[^:@]+@/, ':****@');
        console.log('[Prisma] Database URL construída:', safeUrl);
    }
    
    return url;
}

// Lazy initialization to ensure env vars are loaded
let connectionString: string | null = null;
let pool: Pool | null = null;
let adapter: PrismaPg | null = null;

function getConnectionString(): string {
    if (!connectionString) {
        connectionString = getDatabaseUrl();
    }
    return connectionString;
}

function getPool(): Pool {
    if (!pool) {
        pool = new Pool({ connectionString: getConnectionString() });
    }
    return pool;
}

function getAdapter(): PrismaPg {
    if (!adapter) {
        adapter = new PrismaPg(getPool());
    }
    return adapter;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter: getAdapter() })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
