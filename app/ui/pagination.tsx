'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath: string;
    className?: string;
}

export default function Pagination({ currentPage, totalPages, basePath, className = '' }: PaginationProps) {
    const searchParams = useSearchParams();
    
    // Build URL with existing search params but update page
    const buildUrl = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (page === 1) {
            params.delete('page');
        } else {
            params.set('page', page.toString());
        }
        const queryString = params.toString();
        return `${basePath}${queryString ? `?${queryString}` : ''}`;
    };

    // Calculate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);
            
            if (currentPage <= 3) {
                // Near the start
                for (let i = 2; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('ellipsis');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near the end
                pages.push('ellipsis');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // In the middle
                pages.push('ellipsis');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('ellipsis');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    const pageNumbers = getPageNumbers();

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={`flex items-center justify-center gap-2 ${className}`}>
            {/* Previous Button */}
            <Link
                href={buildUrl(currentPage - 1)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed pointer-events-none'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                aria-label="Página anterior"
            >
                Anterior
            </Link>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
                {pageNumbers.map((page, index) => {
                    if (page === 'ellipsis') {
                        return (
                            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                                ...
                            </span>
                        );
                    }

                    const isActive = page === currentPage;
                    return (
                        <Link
                            key={page}
                            href={buildUrl(page)}
                            className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium transition-colors text-center ${
                                isActive
                                    ? 'bg-[#6546b8] text-white'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                            aria-label={`Ir para página ${page}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {page}
                        </Link>
                    );
                })}
            </div>

            {/* Next Button */}
            <Link
                href={buildUrl(currentPage + 1)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed pointer-events-none'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                aria-label="Próxima página"
            >
                Próxima
            </Link>
        </div>
    );
}

