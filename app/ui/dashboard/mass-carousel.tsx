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
                                    <h3 className="text-white font-bold text-lg text-center capitalize">
                                        {format(mass.date, 'EEEE', { locale: ptBR })}
                                    </h3>
                                    <p className="text-white/80 text-center text-sm mt-1">
                                        {format(mass.date, 'dd/MM/yyyy HH:mm')}
                                    </p>
                                </div>
                                <div className="p-4 space-y-3 bg-[#f6f5f8] flex-1 flex flex-col">
                                    {Object.entries(participants).slice(0, 4).map(([role, names]) => (
                                        <div key={role} className="pb-2 border-b border-gray-100 last:border-0 last:pb-0 flex-shrink-0">
                                            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">{role}</span>
                                            <p className="text-sm text-gray-700 mt-0.5">
                                                {Array.isArray(names) ? names.join(', ') : names}
                                            </p>
                                        </div>
                                    ))}
                                    {Object.keys(participants).length > 4 && (
                                        <p className="text-xs text-gray-400 italic pt-1 flex-shrink-0">e mais {Object.keys(participants).length - 4}...</p>
                                    )}
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
