'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EditParticipantsModal from '../masses/edit-participants-modal';

// Define type based on Prisma return, or explicit interface
interface Mass {
    id: string;
    slug: string;
    date: Date;
    type?: string;
    description?: string;
    participants: any; // Json - Record<string, string[]>
}

interface MassCarouselProps {
    masses: Mass[];
    isLoggedIn?: boolean;
    config?: any;
}

export default function MassCarousel({ masses, isLoggedIn = false, config }: MassCarouselProps) {
    const router = useRouter();
    const [selectedMass, setSelectedMass] = useState<Mass | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!masses || masses.length === 0) {
        return (
            <div className="p-4 bg-[#f6f5f8] rounded">
                <p className="text-gray-500 text-center">Nenhuma missa agendada para os próximos dias.</p>
            </div>
        );
    }

    const handleCardClick = (mass: Mass) => {
        if (isLoggedIn) {
            // Navigate to edit page for logged-in users
            router.push(`/dashboard/masses/${mass.id}/edit`);
        } else {
            // Open modal for non-logged-in users
            setSelectedMass(mass);
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMass(null);
    };

    return (
        <>
            <div className="w-full overflow-x-auto pb-4">
                <div className="flex space-x-4 min-w-max">
                    {masses.map((mass) => {
                        const participants = mass.participants as Record<string, string[]>;
                        
                        // Pegar todos os roles da configuração com suas quantidades
                        const participantConfig = config?.participantConfig as { roles?: [string, number][] } | undefined;
                        const allRoles = participantConfig?.roles || [];
                        
                        // Criar mapa de roles com quantidades esperadas
                        const roleQuantityMap = new Map<string, number>();
                        allRoles.forEach(([roleName, quantity]) => {
                            roleQuantityMap.set(roleName, quantity);
                        });
                        
                        // Renderizar roles - usar config se disponível, senão usar participantes existentes
                        const rolesToDisplay = allRoles.length > 0 
                            ? allRoles.map(([roleName]) => roleName)
                            : Object.keys(participants).slice(0, 4);
                        
                        return (
                            <div 
                                key={mass.id} 
                                onClick={() => handleCardClick(mass)}
                                className={`w-64 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 flex-shrink-0 flex flex-col min-h-[280px] transition-all ${
                                    isLoggedIn || !isLoggedIn 
                                        ? 'cursor-pointer hover:shadow-md hover:border-[#6d7749]' 
                                        : ''
                                }`}
                            >
                                <div className="bg-[#6d7749] p-4 flex-shrink-0">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <h3 className="text-white font-bold text-lg text-center capitalize">
                                            {format(mass.date, 'EEEE', { locale: ptBR })}
                                        </h3>
                                        {mass.type && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                mass.type === 'Missa' 
                                                    ? 'bg-green-500 text-white' 
                                                    : 'bg-blue-500 text-white'
                                            }`}>
                                                {mass.type}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-white/80 text-center text-sm mt-1">
                                        {format(mass.date, 'dd/MM/yyyy HH:mm')}
                                    </p>
                                </div>
                                <div className="p-4 space-y-3 bg-[#f6f5f8] flex-1 flex flex-col">
                                    {mass.description && (
                                        <div className="pb-2 border-b border-gray-200 flex-shrink-0">
                                            <div 
                                                className="text-sm text-gray-700 line-clamp-2 max-w-none [&_strong]:font-bold [&_em]:italic [&_p[style*='text-align:center']]:text-center"
                                                title={mass.description.replace(/<[^>]*>/g, '')}
                                                dangerouslySetInnerHTML={{ 
                                                    __html: mass.description 
                                                }}
                                            />
                                        </div>
                                    )}
                                    {rolesToDisplay.map((roleName) => {
                                        const names = participants[roleName] || [];
                                        const currentCount = Array.isArray(names) ? names.length : 0;
                                        const expectedQuantity = roleQuantityMap.get(roleName) || 0;
                                        const remaining = expectedQuantity - currentCount;
                                        const isEmpty = currentCount === 0;
                                        const isComplete = expectedQuantity > 0 && currentCount >= expectedQuantity;
                                        
                                        return (
                                            <div key={roleName} className="pb-2 border-b border-gray-100 last:border-0 last:pb-0 flex-shrink-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">{roleName}</span>
                                                    {expectedQuantity > 0 && (
                                                        <span className={`text-xs font-medium ${
                                                            isComplete ? 'text-green-600' : 'text-orange-600'
                                                        }`}>
                                                            {currentCount}/{expectedQuantity}
                                                        </span>
                                                    )}
                                                </div>
                                                {isEmpty ? (
                                                    <p className="text-sm mt-0.5 text-gray-400 italic">
                                                        {expectedQuantity > 0 
                                                            ? `(vazio - faltam ${expectedQuantity})` 
                                                            : '(vazio)'}
                                                    </p>
                                                ) : (
                                                    <>
                                                        <p className="text-sm mt-0.5 text-gray-700">
                                                            {Array.isArray(names) ? names.join(', ') : names}
                                                        </p>
                                                        {remaining > 0 && (
                                                            <p className="text-xs mt-1 text-orange-600 font-medium">
                                                                faltam {remaining} {remaining === 1 ? 'vaga' : 'vagas'}
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {selectedMass && config && (
                <EditParticipantsModal
                    mass={selectedMass}
                    config={config}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
}
