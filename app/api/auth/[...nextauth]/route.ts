import { handlers } from '@/auth';
import { NextRequest } from 'next/server';

// Wrapper to intercept and fix redirect URLs
async function handleRequest(
    handler: (req: NextRequest) => Promise<Response>,
    req: NextRequest
): Promise<Response> {
    const response = await handler(req);
    
    // If it's a redirect, fix the URL to use the request origin
    if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location) {
            // Get the request origin
            const host = req.headers.get('host') || 'localhost:3115';
            const protocol = req.headers.get('x-forwarded-proto') || 
                           (req.headers.get('x-forwarded-ssl') === 'on' ? 'https' : 'http');
            
            // Normalize hostname: if it's 0.0.0.0, use localhost instead
            let normalizedHost = host;
            if (host.startsWith('0.0.0.0:')) {
                normalizedHost = host.replace('0.0.0.0:', 'localhost:');
            } else if (host === '0.0.0.0') {
                normalizedHost = 'localhost:3115';
            }
            
            const origin = `${protocol}://${normalizedHost}`;
            
            // If location is an absolute URL pointing to production, replace with current origin
            if (location.startsWith('http')) {
                const url = new URL(location);
                // If it's pointing to production, replace with current origin
                if (url.hostname.includes('paroquia-dev') || url.hostname.includes('furukawatech')) {
                    const path = url.pathname + url.search;
                    const newLocation = `${origin}${path}`;
                    response.headers.set('location', newLocation);
                } else if (url.hostname === '0.0.0.0' || url.hostname === '127.0.0.1') {
                    // Normalize 0.0.0.0 to localhost
                    const path = url.pathname + url.search;
                    const newLocation = `${origin}${path}`;
                    response.headers.set('location', newLocation);
                }
            } else if (location.startsWith('/')) {
                // Relative URL - ensure it uses the correct origin
                const newLocation = `${origin}${location}`;
                response.headers.set('location', newLocation);
            }
        }
    }
    
    return response;
}

export async function GET(req: NextRequest) {
    return handleRequest(handlers.GET, req);
}

export async function POST(req: NextRequest) {
    return handleRequest(handlers.POST, req);
}

