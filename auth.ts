import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// Validate required environment variables for authentication
function validateAuthSecrets() {
    const requiredSecrets = ['AUTH_SECRET', 'NEXTAUTH_SECRET', 'JWT_SECRET'];
    const missingSecrets = requiredSecrets.filter(secret => !process.env[secret]);
    
    if (missingSecrets.length > 0) {
        const secretsList = missingSecrets.join(', ');
        throw new Error(
            `Variáveis de ambiente de autenticação não configuradas: ${secretsList}. ` +
            `Por favor, configure estas variáveis em seu arquivo .env. ` +
            `Você pode gerar valores seguros com: openssl rand -base64 32`
        );
    }
}

// Validate secrets on module load
if (process.env.NODE_ENV !== 'test') {
    validateAuthSecrets();
}

async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

// NEXTAUTH_URL should NOT be set when running locally
// When NEXTAUTH_URL is undefined, NextAuth uses trustHost: true and the request origin
// This allows localhost/0.0.0.0 to work correctly
// Only set NEXTAUTH_URL in production environments

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;
                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.tenantId = user.tenantId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.tenantId = token.tenantId as string;
            }
            return session;
        },
    },
});
