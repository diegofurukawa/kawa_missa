import type { Metadata } from "next";
import { RetryButton } from "./retry-button";

export const metadata: Metadata = {
  title: "Offline",
  description: "Você está offline",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-[#6c7948] via-[#5d6541] to-[#6546b8] text-white">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">Você está offline</h1>
        <p className="text-lg md:text-xl mb-12">
          Verifique sua conexão com a internet e tente novamente
        </p>
        <RetryButton />
      </div>
    </div>
  );
}
