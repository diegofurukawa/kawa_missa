import { headers } from 'next/headers';

export type ShareUrlType = 'dashboard' | 'mass-edit';

interface ShareUrlGeneratorProps {
    type: ShareUrlType;
    tenantId?: string;
    massId?: string;
}

/**
 * Server component that generates shareable URLs based on the type
 * This component should be used in server components only
 */
export async function generateShareUrl({ type, tenantId, massId }: ShareUrlGeneratorProps): Promise<string> {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || 'http';

    switch (type) {
        case 'dashboard':
            if (!tenantId) {
                throw new Error('tenantId is required for dashboard share URL');
            }
            return `${protocol}://${host}/dashboard/public?tenant=${tenantId}`;
        
        case 'mass-edit':
            if (!massId) {
                throw new Error('massId is required for mass-edit share URL');
            }
            return `${protocol}://${host}/dashboard/public/masses/${massId}/edit`;
        
        default:
            throw new Error(`Unknown share URL type: ${type}`);
    }
}

