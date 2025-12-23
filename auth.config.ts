import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnLogin = nextUrl.pathname.startsWith('/login');
            const isOnOnboarding = nextUrl.pathname.startsWith('/onboarding');
            const isOnPublic = nextUrl.pathname.startsWith('/dashboard/public');

            // Normalize hostname to maintain consistency
            // Always normalize 0.0.0.0 to localhost to prevent URL changes during navigation
            // This ensures that if user starts with localhost, it stays localhost
            let hostname = nextUrl.hostname;
            const port = nextUrl.port || (nextUrl.protocol === 'https:' ? '443' : '80');
            const protocol = nextUrl.protocol;
            
            // Always normalize 0.0.0.0 and 127.0.0.1 to localhost
            // This prevents URL changes from localhost to 0.0.0.0 during navigation
            if (hostname === '0.0.0.0' || hostname === '127.0.0.1') {
                hostname = 'localhost';
            }
            
            // Construct base URL with normalized hostname
            // This ensures URL consistency throughout the entire session
            const baseUrl = `${protocol}//${hostname}${port && port !== '80' && port !== '443' ? `:${port}` : ''}`;

            // Allow public routes
            if (isOnLogin || isOnOnboarding || isOnPublic) {
                if (isLoggedIn && isOnLogin) {
                    // Redirect authenticated users away from login page
                    return Response.redirect(new URL('/dashboard', baseUrl));
                }
                return true;
            }

            // Protect dashboard routes
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                // Redirect unauthenticated users to login page
                return Response.redirect(new URL('/login', baseUrl));
            }

            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
