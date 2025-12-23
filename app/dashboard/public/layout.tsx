export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#f6f5f8]">
            {children}
        </div>
    );
}

