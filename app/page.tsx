import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();

  // Se o usuário estiver autenticado, redirecionar para o dashboard
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-gradient-to-br from-[#6d7749] via-[#5d6541] to-[#6546b8] text-white">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">Kawa Missa</h1>
        <p className="text-lg md:text-xl mb-12 opacity-95 font-light">Gestão Paroquial Simplificada</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/login" 
            className="w-full sm:w-auto bg-white text-[#6d7749] px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Login
          </Link>
          <Link 
            href="/onboarding" 
            className="w-full sm:w-auto border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
          >
            Criar Conta
          </Link>
        </div>

        <div className="mt-20 text-sm opacity-70">
          Sistema de Governança e Liturgia
        </div>
      </div>
    </div>
  );
}
