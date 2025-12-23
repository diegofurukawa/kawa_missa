import LoginForm from '@/app/ui/login/login-form';

export default function LoginPage() {
    return (
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f6f5f8] via-white to-[#f6f5f8] p-4">
            <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5">
                <div className="flex w-full items-end rounded-lg bg-[#6d7749] p-4 md:h-20 shadow-md">
                    <div className="w-32 text-white md:w-36 font-bold text-lg">
                        Kawa Missa
                    </div>
                </div>
                <LoginForm />
            </div>
        </main>
    );
}
