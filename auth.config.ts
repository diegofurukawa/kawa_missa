import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnPublicDashboard = nextUrl.pathname.startsWith('/dashboard/public');
            const isOnSelectTenant = nextUrl.pathname.startsWith('/select-tenant');
            const isOnLogin = nextUrl.pathname.startsWith('/login');
            const isOnOnboarding = nextUrl.pathname.startsWith('/onboarding');

            // Normalize hostname to maintain consistency
            let hostname = nextUrl.hostname;
            const port = nextUrl.port || (nextUrl.protocol === 'https:' ? '443' : '80');
            const protocol = nextUrl.protocol;

            // Always normalize 0.0.0.0 and 127.0.0.1 to localhost
            if (hostname === '0.0.0.0' || hostname === '127.0.0.1') {
                hostname = 'localhost';
            }

            // Construct base URL with normalized hostname
            const baseUrl = `${protocol}//${hostname}${port && port !== '80' && port !== '443' ? `:${port}` : ''}`;

            // Permitir acesso a rotas públicas
            if (isOnPublicDashboard || isOnSelectTenant || isOnLogin || isOnOnboarding) {
                if (isLoggedIn && isOnLogin) {
                    // Redirect authenticated users away from login page
                    return Response.redirect(new URL('/dashboard', baseUrl));
                }
                return true;
            }

            // Se está em dashboard privado sem login, redireciona para público
            if (isOnDashboard && !isLoggedIn) {
                const tenantId = nextUrl.searchParams.get('tenant');
                const redirectUrl = tenantId
                    ? `/dashboard/public?tenant=${tenantId}`
                    : '/select-tenant?redirect=/dashboard/public';
                return Response.redirect(new URL(redirectUrl, baseUrl));
            }

            // Protect dashboard routes for logged in users
            if (isOnDashboard && isLoggedIn) {
                return true;
            }

            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
