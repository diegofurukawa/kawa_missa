'use client';

import { createTenant } from '@/lib/actions';
import { useActionState } from 'react';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function OnboardingForm() {
    const [state, dispatch, isPending] = useActionState(createTenant, undefined);

    useEffect(() => {
        if (state?.message) {
            toast.error(state.message);
        }
    }, [state?.message]);

    return (
        <form action={dispatch} className="space-y-3">
            <div className="flex-1 rounded-lg bg-white px-6 pb-4 pt-8 shadow-md">
                <h1 className="mb-3 text-2xl font-semibold text-gray-900">
                    Welcome! Create your Organization.
                </h1>

                {/* Tenant Name */}
                <div>
                    <label className="mb-2 mt-5 block text-xs font-medium text-gray-700" htmlFor="tenantName">
                        Organization Name
                    </label>
                    <input
                        className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                        id="tenantName" type="text" name="tenantName" placeholder="Paróquia São José" required
                    />
                    <div id="tenant-error" aria-live="polite" aria-atomic="true">
                        {state?.errors?.tenantName && <p className="mt-2 text-sm text-red-600 font-medium">{state.errors.tenantName}</p>}
                    </div>
                </div>

                {/* User Name */}
                <div>
                    <label className="mb-2 mt-5 block text-xs font-medium text-gray-700" htmlFor="userName">
                        Your Name (Admin)
                    </label>
                    <input
                        className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                        id="userName" type="text" name="userName" placeholder="João Silva" required
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="mb-2 mt-5 block text-xs font-medium text-gray-700" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                        id="email" type="email" name="email" placeholder="joao@example.com" required
                    />
                    <div id="email-error" aria-live="polite" aria-atomic="true">
                        {state?.errors?.email && <p className="mt-2 text-sm text-red-600 font-medium">{state.errors.email}</p>}
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="mb-2 mt-5 block text-xs font-medium text-gray-700" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                        id="password" type="password" name="password" required minLength={6}
                    />
                    <div id="password-error" aria-live="polite" aria-atomic="true">
                        {state?.errors?.password && <p className="mt-2 text-sm text-red-600 font-medium">{state.errors.password}</p>}
                    </div>
                </div>

                {/* Phone */}
                <div>
                    <label className="mb-2 mt-5 block text-xs font-medium text-gray-700" htmlFor="phone">
                        Phone (Optional)
                    </label>
                    <input
                        className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                        id="phone" type="tel" name="phone" placeholder="(11) 99999-9999"
                    />
                </div>

                <button 
                    className="mt-6 w-full bg-[#6d7749] hover:bg-[#5d6541] text-white p-2.5 rounded-md font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed" 
                    aria-disabled={isPending}
                    disabled={isPending}
                >
                    {isPending ? 'Creating Account...' : 'Create Account'}
                </button>
            </div>
        </form>
    );
}
