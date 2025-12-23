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
            
            // Allow public routes
            if (isOnLogin || isOnOnboarding || isOnPublic) {
                if (isLoggedIn && isOnLogin) {
                    // Redirect authenticated users away from login page
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
                return true;
            }
            
            // Protect dashboard routes
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                // Redirect unauthenticated users to login page
                return Response.redirect(new URL('/login', nextUrl));
            }
            
            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
