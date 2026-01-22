'use client';

import { authenticate } from '@/lib/actions';
import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const router = useRouter();
    const [errorMessage, dispatch, isPending] = useActionState(
        authenticate,
        undefined,
    );

    // Track if form has been submitted to avoid redirect on initial mount
    const hasSubmitted = useRef(false);

    // Track when form submission starts
    useEffect(() => {
        if (isPending) {
            hasSubmitted.current = true;
        }
    }, [isPending]);

    // Handle successful login (when errorMessage is undefined after submission)
    useEffect(() => {
        if (!isPending && errorMessage === undefined && hasSubmitted.current) {
            // Force a full page reload to ensure session is properly loaded
            window.location.href = '/dashboard';
        }
    }, [isPending, errorMessage]);

    return (
        <form action={dispatch} className="space-y-3">
            <div className="flex-1 rounded-lg bg-white px-6 pb-4 pt-8 shadow-md">
                <h1 className="mb-3 text-2xl font-semibold text-gray-900">
                    Please log in to continue.
                </h1>
                <div className="w-full">
                    <div>
                        <label
                            className="mb-2 mt-5 block text-xs font-medium text-gray-700"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label
                            className="mb-2 mt-5 block text-xs font-medium text-gray-700"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border border-gray-300 py-[9px] pl-3 pr-3 text-sm outline-none placeholder:text-gray-400 text-gray-900 transition-all focus:border-[#6d7749] focus:ring-2 focus:ring-[#6d7749]/20"
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Enter password"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                </div>
                <button
                    className="mt-6 w-full bg-[#6d7749] hover:bg-[#5d6541] text-white p-2.5 rounded-md font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-disabled={isPending}
                    disabled={isPending}
                >
                    {isPending ? 'Logging in...' : 'Log in'}
                </button>
                <div
                    className="flex h-8 items-end space-x-1"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {errorMessage && (
                        <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
                    )}
                </div>
            </div>
        </form>
    );
}
