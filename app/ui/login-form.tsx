'use client';

import { useActionState } from 'react';
import { authenticate } from '@/lib/actions';
import { toast } from 'sonner';
import { useEffect } from 'react';

// Package json doesn't show icons. I'll use simple SVGs or just text/emoji if icons missing. 
// Or I can install heroicons. `yarn add @heroicons/react`.
// I'll assume standard icons or no icons to stay safe. I'll use simple text labels or unicode if needed.
// Actually, I can use text for now to avoid dependency error. Or check if lucide-react is there. It's not in package.json.
// I'll stick to text labels and Sonner.

export default function LoginForm() {
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
        }
    }, [errorMessage]);

    return (
        <form action={formAction} className="space-y-3">
            <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h1 className="mb-3 text-2xl font-bold dark:text-white">
                    Please log in to continue.
                </h1>
                <div className="w-full">
                    <div>
                        <label
                            className="mb-3 mt-5 block text-xs font-medium text-gray-900 dark:text-gray-300"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-gray-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
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
                            className="mb-3 mt-5 block text-xs font-medium text-gray-900 dark:text-gray-300"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-gray-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
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
                <div className="mt-6">
                    <button
                        className="flex h-10 w-full items-center justify-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
                        aria-disabled={isPending}
                    >
                        Log in {isPending && '...'}
                    </button>
                </div>
                {errorMessage && (
                    <div
                        className="flex h-8 items-end space-x-1"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        <p className="text-sm text-red-500">{errorMessage}</p>
                    </div>
                )}
            </div>
        </form>
    );
}
