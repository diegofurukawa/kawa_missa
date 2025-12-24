import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Build DATABASE_URL from individual variables if needed
function getDatabaseUrl(): string {
    const dbUrl = process.env.DATABASE_URL;
    const isDockerBuild = process.env.DOCKER_BUILD === 'true';
    
    // Check if DATABASE_URL is valid (no placeholders)
    const hasValidDatabaseUrl = dbUrl && 
        dbUrl.trim() !== '' && 
        !dbUrl.includes('${') && 
        !dbUrl.includes('host_database') &&
        (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'));
    
    if (hasValidDatabaseUrl) {
        return dbUrl;
    }
    
    // If DATABASE_URL contains placeholders, log warning and fall back to individual variables
    if (dbUrl && (dbUrl.includes('host_database') || dbUrl.includes('${'))) {
        if (!isDockerBuild) {
            console.warn('[Prisma] DATABASE_URL contém placeholders não substituídos. Tentando usar variáveis individuais...');
        }
    }
    
    // Build from individual variables
    const dbHost = process.env.DB_HOST;
    const dbPort = process.env.DB_PORT || '5432';
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'kawa_missa';
    const dbSchema = process.env.DB_SCHEMA || 'public';
    
    // During Docker build, use dummy values to allow build to complete
    // The real values will be injected at runtime via docker-compose
    if (isDockerBuild) {
        const dummyHost = dbHost && dbHost !== 'host_database' && !dbHost.includes('${') 
            ? dbHost 
            : 'localhost';
        const dummyUrl = `postgresql://${dbUser}:${dbPassword}@${dummyHost}:${dbPort}/${dbName}?schema=${dbSchema}`;
        return dummyUrl;
    }
    
    // Validate that we have at least the essential variables and they're not placeholders
    const hasValidHost = dbHost && 
        dbHost.trim() !== '' && 
        dbHost !== 'host_database' && 
        !dbHost.includes('${');
    
    if (!hasValidHost) {
        console.error('[Prisma] Erro na configuração do banco de dados:');
        console.error('[Prisma] DATABASE_URL:', dbUrl ? `definido mas inválido (contém placeholders: ${dbUrl.includes('host_database') ? 'host_database' : dbUrl.includes('${') ? '${}' : 'outros'})` : 'não definido');
        console.error('[Prisma] DB_HOST:', dbHost || 'não definido');
        console.error('[Prisma] DB_USER:', dbUser || 'não definido');
        console.error('[Prisma] DB_NAME:', dbName || 'não definido');
        throw new Error('Configuração do banco de dados inválida. As variáveis de ambiente DATABASE_URL ou DB_HOST devem estar configuradas e não devem conter placeholders como "host_database" ou "${}". Verifique suas variáveis de ambiente.');
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
        const connString = getConnectionString();
        console.log('[Prisma Pool] Criando pool de conexões...');
        console.log('[Prisma Pool] Connection string (safe):', connString.replace(/:[^:@]+@/, ':****@'));

        pool = new Pool({
            connectionString: connString,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 30000,
            max: 20,
        });

        pool.on('error', (err) => {
            console.error('[Prisma Pool] Erro inesperado no pool de conexões:', err);
        });

        pool.on('connect', () => {
            console.log('[Prisma Pool] Nova conexão estabelecida com sucesso');
        });
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

export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter: getAdapter(),
    log: process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['query', 'error', 'warn']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
