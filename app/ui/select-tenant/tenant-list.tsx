'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building2 } from 'lucide-react';

interface Tenant {
    id: string;
    name: string;
    denomination: string | null;
}

interface TenantListProps {
    tenants: Tenant[];
    redirectUrl: string;
}

export default function TenantList({ tenants, redirectUrl }: TenantListProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrar tenants baseado na busca
    const filteredTenants = tenants.filter(tenant => {
        const searchLower = searchTerm.toLowerCase();
        const name = tenant.name?.toLowerCase() || '';
        const denomination = tenant.denomination?.toLowerCase() || '';
        return name.includes(searchLower) || denomination.includes(searchLower);
    });

    const handleTenantSelect = (tenantId: string) => {
        router.push(`${redirectUrl}?tenant=${tenantId}`);
    };

    if (tenants.length === 0) {
        return (
            <div className="text-center py-12">
                <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">Nenhuma organização cadastrada no momento.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Barra de busca */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome da paróquia..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6d7749] focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Lista de tenants */}
            {filteredTenants.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">Nenhuma organização encontrada com "{searchTerm}"</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTenants.map((tenant) => (
                        <button
                            key={tenant.id}
                            onClick={() => handleTenantSelect(tenant.id)}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#6d7749] hover:shadow-md transition-all text-left group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-[#6d7749]/10 rounded-full flex items-center justify-center group-hover:bg-[#6d7749]/20 transition-colors">
                                    <Building2 className="w-6 h-6 text-[#6d7749]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#6d7749] transition-colors truncate">
                                        {tenant.denomination || tenant.name}
                                    </h3>
                                    {tenant.denomination && tenant.denomination !== tenant.name && (
                                        <p className="text-sm text-gray-600 mt-1 truncate">
                                            {tenant.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
