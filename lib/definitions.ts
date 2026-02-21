import { z } from 'zod';

export const LoginFormSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(1, { message: 'Password field must not be empty.' }),
});

export const OnboardingFormSchema = z.object({
    tenantName: z.string().min(2, { message: 'Tenant name must be at least 2 characters.' }),
    adminName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    phone: z.string().optional(),
});

export type State = {
    errors?: {
        tenantName?: string[];
        adminName?: string[];
        email?: string[];
        password?: string[];
        phone?: string[];
    };
    message?: string | null;
};

// Config types for mass carousel and configuration
export interface ParticipantConfig {
    roles?: [string, number][]; // [roleName, quantity]
}

export interface CronConfig {
    [key: string]: unknown;
}

export interface Config {
    id: string;
    tenantId: string;
    cronConfig: CronConfig;
    participantConfig: ParticipantConfig;
    createdAt?: Date;
    updatedAt?: Date;
}
