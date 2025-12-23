import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Build DATABASE_URL from individual variables if needed
function getDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL;
  
  // If DATABASE_URL is set and doesn't contain placeholders, use it
  if (dbUrl && !dbUrl.includes('${')) {
    return dbUrl;
  }
  
  // Otherwise, build from individual variables
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || '5432';
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'kawa_missa';
  const dbSchema = process.env.DB_SCHEMA || 'public';
  
  return `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=${dbSchema}`;
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: getDatabaseUrl(),
  },
});
