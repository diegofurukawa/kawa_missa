"use client";

export function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="bg-white text-[#6c7948] px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg"
    >
      Tentar Novamente
    </button>
  );
}
