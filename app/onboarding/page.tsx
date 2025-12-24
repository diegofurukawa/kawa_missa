import type { Metadata } from "next";
import OnboardingForm from '@/app/ui/onboarding-form';

export const metadata: Metadata = {
  title: "Criar Conta",
  description: "Crie sua conta e comece a gerenciar sua paróquia",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OnboardingPage() {
    return (
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f6f5f8] via-white to-[#f6f5f8] p-4">
            <div className="relative mx-auto flex w-full max-w-[500px] flex-col space-y-2.5">
                <div className="flex w-full items-end rounded-lg bg-[#6d7749] p-4 md:h-20 shadow-md">
                    <div className="w-32 text-white md:w-36 font-bold text-lg">
                        Kawa Missa
                    </div>
                </div>
                <OnboardingForm />
            </div>
        </main>
    );
}
