'use server';

import { signIn, auth } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';

// Type guard for Prisma errors
function isPrismaError(error: unknown): error is { code: string; meta?: { target?: unknown } } {
    if (typeof error !== 'object' || error === null) {
        return false;
    }
    const errorObj = error as Record<string, unknown>;
    return (
        'code' in errorObj &&
        typeof errorObj.code === 'string' &&
        errorObj.code.startsWith('P')
    );
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', { 
            ...Object.fromEntries(formData), 
            redirectTo: '/dashboard',
            redirect: true 
        });
        // If we get here, redirect happened successfully
        return undefined;
    } catch (error) {
        // Next.js redirects throw errors, but that's expected behavior
        // Check if it's a redirect error (which means success)
        if (error && typeof error === 'object') {
            const errorObj = error as Record<string, unknown>;
            // Next.js redirect errors have specific structure
            if (
                (typeof errorObj.digest === 'string' && errorObj.digest.startsWith('NEXT_REDIRECT')) ||
                (typeof errorObj.message === 'string' && errorObj.message.includes('NEXT_REDIRECT')) ||
                (errorObj.cause && typeof errorObj.cause === 'object' && 'name' in errorObj.cause && errorObj.cause.name === 'NEXT_REDIRECT')
            ) {
                // This is actually a successful redirect
                throw error; // Re-throw to let Next.js handle the redirect
            }
        }
        
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Credenciais inválidas. Por favor, verifique seu email e senha.';
                default:
                    return 'Algo deu errado. Por favor, tente novamente.';
            }
        }
        
        console.error('Authentication error:', error);
        return 'Erro ao fazer login. Por favor, tente novamente.';
    }
}

const OnboardingSchema = z.object({
    tenantName: z.string().min(3, 'Tenant name required'),
    userName: z.string().min(3, 'User name required'),
    email: z.string().email(),
    password: z.string().min(6, 'Password min 6 chars'),
    phone: z.string().optional(),
});

export async function createTenant(prevState: unknown, formData: FormData) {
    const validatedFields = OnboardingSchema.safeParse({
        tenantName: formData.get('tenantName'),
        userName: formData.get('userName'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Por favor, preencha todos os campos obrigatórios.',
        };
    }

    const { tenantName, userName, email, password, phone } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // TypeScript needs explicit type here - will be properly typed once Prisma client is generated
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await prisma.$transaction(async (tx: any) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: tenantName,
                    email: email,
                    phone: phone,
                }
            });

            await tx.user.create({
                data: {
                    tenantId: tenant.id,
                    name: userName,
                    email: email,
                    password: hashedPassword,
                    phone: phone,
                    role: 'ADMIN',
                }
            });
        });

    } catch (err) {
        console.error(err);
        
        // Handle Prisma unique constraint errors
        if (isPrismaError(err)) {
            if (err.code === 'P2002') {
                const target = err.meta?.target;
                if (Array.isArray(target) && target.includes('email')) {
                    return { message: 'Este email já está cadastrado. Por favor, use outro email ou faça login.' };
                }
                return { message: 'Já existe um registro com esses dados. Por favor, verifique os dados informados.' };
            }
            // Handle other Prisma errors
            return { message: 'Erro ao criar conta. Por favor, tente novamente.' };
        }
        
        return { message: 'Erro ao criar conta. Por favor, verifique os dados e tente novamente.' };
    }

    try {
        await signIn('credentials', { email, password, redirect: false });
    } catch (e) {
        console.error("Auto-login failed", e);
    }

    redirect('/dashboard');
}

// --- TENANT ACTIONS ---

const TenantSchema = z.object({
    denomination: z.string().min(3),
    legalName: z.string().min(3),
    document: z.string().min(3),
    responsibleName: z.string().min(3),
    phone: z.string().optional(),
    zipCode: z.string().min(8),
    street: z.string().min(1),
    number: z.string().min(1),
    neighborhood: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(2),
});

export async function upsertTenant(prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) return { message: 'Não autorizado. Por favor, faça login novamente.' };

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { message: 'Usuário não encontrado. Por favor, faça login novamente.' };

    const validatedFields = TenantSchema.safeParse({
        denomination: formData.get('denomination'),
        legalName: formData.get('legalName'),
        document: formData.get('document'),
        responsibleName: formData.get('responsibleName'),
        phone: formData.get('phone'),
        zipCode: formData.get('zipCode'),
        street: formData.get('street'),
        number: formData.get('number'),
        neighborhood: formData.get('neighborhood'),
        city: formData.get('city'),
        state: formData.get('state'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Por favor, preencha todos os campos obrigatórios.',
        };
    }

    const data = validatedFields.data;

    try {
        // Update tenant
        await prisma.tenant.update({
            where: { id: user.tenantId },
            data: {
                denomination: data.denomination,
                legalName: data.legalName,
                document: data.document,
                responsibleName: data.responsibleName,
                phone: data.phone,
                address: {
                    upsert: {
                        create: {
                            zipCode: data.zipCode,
                            street: data.street,
                            number: data.number,
                            neighborhood: data.neighborhood,
                            city: data.city,
                            state: data.state,
                        },
                        update: {
                            zipCode: data.zipCode,
                            street: data.street,
                            number: data.number,
                            neighborhood: data.neighborhood,
                            city: data.city,
                            state: data.state,
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error(err);
        if (isPrismaError(err)) {
            if (err.code === 'P2002') {
                return { message: 'Já existe um registro com esses dados. Por favor, verifique as informações.' };
            }
            return { message: 'Erro ao salvar informações. Por favor, tente novamente.' };
        }
        return { message: 'Erro ao salvar informações. Por favor, verifique os dados e tente novamente.' };
    }

    revalidatePath('/dashboard/organization');
    return { message: 'Informações salvas com sucesso!', success: true };
}


// --- MASS ACTIONS ---

const MassSchema = z.object({
    tenantId: z.string(),
    date: z.string(), // ISO datetime string from combined date and time
});

export async function createMass(prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) return { message: 'Não autorizado. Por favor, faça login novamente.' };

    const validatedFields = MassSchema.safeParse({
        tenantId: formData.get('tenantId'),
        date: formData.get('date'),
    });

    if (!validatedFields.success) {
        return { message: 'Dados inválidos. Por favor, verifique as informações preenchidas.' };
    }

    const { tenantId, date } = validatedFields.data;
    const dateObj = new Date(date);
    const slug = format(dateObj, "yyyyMMdd_HHmm");

    // Parse participants from formData dynamic keys
    // Format: role_${roleName} -> multiple participants per role (multiple values for same key)
    const participants: Record<string, string[]> = {};
    formData.forEach((value, key) => {
        if (key.startsWith('role_')) {
            const roleName = key.replace('role_', '');
            const participantName = value.toString().trim();
            
            if (participantName !== '') {
                if (!participants[roleName]) {
                    participants[roleName] = [];
                }
                participants[roleName].push(participantName);
            }
        }
    });

    try {
        await prisma.mass.create({
            data: {
                tenantId,
                date: dateObj,
                slug,
                participants: participants,
            }
        });
    } catch (err) {
        console.error(err);
        if (isPrismaError(err)) {
            if (err.code === 'P2002') {
                return { message: 'Já existe uma missa agendada para este horário. Por favor, escolha outro horário.' };
            }
            return { message: 'Erro ao criar missa. Por favor, tente novamente.' };
        }
        return { message: 'Erro ao criar missa. Por favor, verifique os dados e tente novamente.' };
    }

    revalidatePath('/dashboard/masses');
    redirect('/dashboard/masses');
}

export async function deleteMass(id: string) {
    try {
        await prisma.mass.delete({ where: { id } });
        revalidatePath('/dashboard/masses');
    } catch {
        return { message: 'Failed to delete' };
    }
}

export async function updateMass(id: string, prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) return { message: 'Não autorizado. Por favor, faça login novamente.' };

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { message: 'Usuário não encontrado. Por favor, faça login novamente.' };

    // Verify the mass belongs to the user's tenant
    const mass = await prisma.mass.findUnique({
        where: { id },
        select: { tenantId: true }
    });

    if (!mass || mass.tenantId !== user.tenantId) {
        return { message: 'Missa não encontrada ou não autorizada.' };
    }

    const validatedFields = MassSchema.safeParse({
        tenantId: formData.get('tenantId'),
        date: formData.get('date'),
    });

    if (!validatedFields.success) {
        return { message: 'Dados inválidos. Por favor, verifique as informações preenchidas.' };
    }

    const { date } = validatedFields.data;
    const dateObj = new Date(date);
    const slug = format(dateObj, "yyyyMMdd_HHmm");

    // Parse participants from formData dynamic keys
    const participants: Record<string, string[]> = {};
    formData.forEach((value, key) => {
        if (key.startsWith('role_')) {
            const roleName = key.replace('role_', '');
            const participantName = value.toString().trim();
            
            if (participantName !== '') {
                if (!participants[roleName]) {
                    participants[roleName] = [];
                }
                participants[roleName].push(participantName);
            }
        }
    });

    try {
        await prisma.mass.update({
            where: { id },
            data: {
                date: dateObj,
                slug,
                participants: participants,
            }
        });
    } catch (err) {
        console.error(err);
        if (isPrismaError(err)) {
            if (err.code === 'P2002') {
                return { message: 'Já existe uma missa agendada para este horário. Por favor, escolha outro horário.' };
            }
            return { message: 'Erro ao atualizar missa. Por favor, tente novamente.' };
        }
        return { message: 'Erro ao atualizar missa. Por favor, verifique os dados e tente novamente.' };
    }

    revalidatePath('/dashboard/masses');
    revalidatePath('/dashboard');
    redirect('/dashboard/masses');
}

export async function updateMassParticipants(id: string, prevState: unknown, formData: FormData) {
    // This action allows public (non-authenticated) access to update only participants
    // No authentication required, but we should validate the mass exists

    // Parse participants from formData dynamic keys
    const participants: Record<string, string[]> = {};
    formData.forEach((value, key) => {
        if (key.startsWith('role_')) {
            const roleName = key.replace('role_', '');
            const participantName = value.toString().trim();
            
            if (participantName !== '') {
                if (!participants[roleName]) {
                    participants[roleName] = [];
                }
                participants[roleName].push(participantName);
            }
        }
    });

    try {
        // Verify the mass exists
        const mass = await prisma.mass.findUnique({
            where: { id },
            select: { id: true }
        });

        if (!mass) {
            return { message: 'Missa não encontrada.' };
        }

        await prisma.mass.update({
            where: { id },
            data: {
                participants: participants,
            }
        });
    } catch (err) {
        console.error(err);
        if (isPrismaError(err)) {
            return { message: 'Erro ao atualizar participantes. Por favor, tente novamente.' };
        }
        return { message: 'Erro ao atualizar participantes. Por favor, verifique os dados e tente novamente.' };
    }

    revalidatePath('/dashboard/public');
    revalidatePath('/dashboard');
    return { message: 'Participantes atualizados com sucesso!', success: true };
}

// --- CONFIG ACTIONS ---

const ConfigSchema = z.object({
    tenantId: z.string().min(1, 'Tenant ID é obrigatório'),
    cronConfig: z.object({
        frequency: z.array(z.string().min(1, 'Expressão cron é obrigatória'))
            .min(1, 'Pelo menos uma expressão cron é obrigatória')
    }),
    participantConfig: z.object({
        roles: z.array(
            z.tuple([
                z.string().min(1, 'Nome do role é obrigatório'),
                z.number().int().positive('Quantidade deve ser um número inteiro positivo')
            ])
        ).min(1, 'Pelo menos um role é obrigatório')
    })
});

export async function createConfig(prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) return { message: 'Não autorizado. Por favor, faça login novamente.' };

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { message: 'Usuário não encontrado. Por favor, faça login novamente.' };

    // Parse cron expressions (TAGs) from formData
    // Format: cron_0, cron_1, etc.
    const frequencies: string[] = [];
    formData.forEach((value, key) => {
        if (key.startsWith('cron_') && value.toString().trim() !== '') {
            frequencies.push(value.toString().trim());
        }
    });

    // Parse roles with quantities from formData
    // Format: role_0, qty_0, role_1, qty_1, etc.
    const roleEntries: Record<number, { role: string; qty: number }> = {};
    formData.forEach((value, key) => {
        if (key.startsWith('role_')) {
            const index = parseInt(key.replace('role_', ''));
            if (!isNaN(index)) {
                if (!roleEntries[index]) {
                    roleEntries[index] = { role: '', qty: 0 };
                }
                roleEntries[index].role = value.toString().trim();
            }
        } else if (key.startsWith('qty_')) {
            const index = parseInt(key.replace('qty_', ''));
            if (!isNaN(index)) {
                if (!roleEntries[index]) {
                    roleEntries[index] = { role: '', qty: 0 };
                }
                const qty = parseInt(value.toString());
                roleEntries[index].qty = isNaN(qty) ? 0 : qty;
            }
        }
    });

    // Convert to array of tuples [role, quantity], filtering out incomplete entries
    const roles: [string, number][] = [];
    Object.keys(roleEntries)
        .map(k => parseInt(k))
        .sort((a, b) => a - b)
        .forEach(index => {
            const entry = roleEntries[index];
            if (entry.role && entry.qty > 0) {
                roles.push([entry.role, entry.qty]);
            }
        });

    const validatedFields = ConfigSchema.safeParse({
        tenantId: user.tenantId,
        cronConfig: {
            frequency: frequencies
        },
        participantConfig: {
            roles: roles
        }
    });

    if (!validatedFields.success) {
        const errorMessages = validatedFields.error.issues
            .map((issue) => issue.message).join(' ');
        
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Por favor, verifique os dados preenchidos. ' + errorMessages,
        };
    }

    const data = validatedFields.data;

    try {
        await prisma.config.create({
            data: {
                tenantId: user.tenantId,
                cronConfig: data.cronConfig,
                participantConfig: data.participantConfig
            }
        });
    } catch (err) {
        console.error(err);
        if (isPrismaError(err)) {
            return { message: 'Erro ao criar configuração. Por favor, tente novamente.' };
        }
        return { message: 'Erro ao criar configuração. Por favor, verifique os dados e tente novamente.' };
    }

    revalidatePath('/dashboard/config');
    redirect('/dashboard/config');
}

export async function deleteConfig(id: string) {
    const session = await auth();
    if (!session?.user?.email) return { message: 'Não autorizado. Por favor, faça login novamente.' };

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { message: 'Usuário não encontrado. Por favor, faça login novamente.' };

    try {
        // Verify the config belongs to the user's tenant
        const config = await prisma.config.findUnique({
            where: { id },
            select: { tenantId: true }
        });

        if (!config || config.tenantId !== user.tenantId) {
            return { message: 'Configuração não encontrada ou não autorizada.' };
        }

        await prisma.config.delete({ where: { id } });
        revalidatePath('/dashboard/config');
        return { message: 'Configuração excluída com sucesso!', success: true };
    } catch (err) {
        console.error(err);
        return { message: 'Erro ao excluir configuração. Por favor, tente novamente.' };
    }
}
