'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/app/ui/button';
import { formatDateToBR } from '@/lib/date-utils';
import type { MassReportSummary } from '@/lib/report-utils';
import ReportPreview from './report-preview';

interface ReportsWorkspaceProps {
    masses: MassReportSummary[];
    from: string;
    to: string;
    hasExplicitFilter: boolean;
    truncated?: boolean;
    initialSelectedIds?: string[];
}

export default function ReportsWorkspace({
    masses,
    from,
    to,
    hasExplicitFilter,
    truncated = false,
    initialSelectedIds = [],
}: ReportsWorkspaceProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
    const [pdfLoading, setPdfLoading] = useState(false);

    const selectedReports = useMemo(
        () => masses.filter((mass) => selectedIds.includes(mass.id)),
        [masses, selectedIds]
    );

    const selectedQuery = useMemo(
        () => new URLSearchParams({ ids: selectedIds.join(',') }).toString(),
        [selectedIds]
    );

    const pdfHref = `/dashboard/reports/export/pdf?${selectedQuery}`;

    const toggleSelection = (massId: string) => {
        setSelectedIds((current) =>
            current.includes(massId)
                ? current.filter((id) => id !== massId)
                : [...current, massId]
        );
    };

    const handlePdfExport = async () => {
        if (selectedIds.length === 0) return;
        setPdfLoading(true);
        try {
            const response = await fetch(pdfHref);
            if (!response.ok) {
                const body = await response.json().catch(() => ({ error: 'Erro ao gerar PDF.' }));
                toast.error(body.error || 'Erro ao gerar PDF.');
                return;
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `relatorio-missas.pdf`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);
        } catch {
            toast.error('Erro ao gerar PDF. Tente novamente.');
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Banner de truncamento — exibido quando o limite de 500 missas e atingido */}
            {truncated && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Apenas as 500 missas mais antigas do periodo estao sendo exibidas. Reduza o intervalo de datas para ver todos os resultados.
                </div>
            )}

            {/* Header card — titulo, periodo, botoes de acao e filtro */}
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    {/* Esquerda: titulo e periodo */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Relatorios</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Selecione missas especificas, revise roles preenchidos e exporte os dados.
                        </p>
                        <p className="mt-1 text-xs font-medium text-[#6d7749]">
                            Periodo: {formatDateToBR(from)} a {formatDateToBR(to)}
                            {!hasExplicitFilter && ' (mes atual)'}
                        </p>
                    </div>

                    {/* Direita: botoes de acao (desktop) + filtro */}
                    <div className="flex flex-wrap items-end gap-3">
                        {/* Imprimir e Exportar Excel — apenas desktop, apenas quando ha selecao */}
                        {selectedIds.length > 0 && (
                            <div className="hidden items-center gap-2 lg:flex">
                                <Link href={`/dashboard/reports/print?${selectedQuery}`} target="_blank">
                                    <Button size="sm" variant="secondary">Imprimir</Button>
                                </Link>
                                {/* <Link href={`/dashboard/reports/export/excel?${selectedQuery}`}>
                                    <Button size="sm" variant="default">Exportar Excel</Button>
                                </Link> */}
                            </div>
                        )}

                        {/* Filtro */}
                        <form className="flex flex-wrap items-end gap-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">De</label>
                                <input
                                    type="date"
                                    name="from"
                                    defaultValue={from}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Ate</label>
                                <input
                                    type="date"
                                    name="to"
                                    defaultValue={to}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                                />
                            </div>
                            <button
                                type="submit"
                                className="rounded-lg bg-[#6d7749] px-4 py-2 text-sm font-medium text-white hover:bg-[#5d6541]"
                            >
                                Filtrar
                            </button>
                        </form>

                        {/* Exportar PDF — todos os breakpoints, apenas quando ha selecao */}
                        {selectedIds.length > 0 && (
                            <Button size="sm" variant="primary" disabled={pdfLoading} onClick={handlePdfExport}>
                                {pdfLoading ? 'Gerando PDF...' : 'Exportar PDF'}
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            {/* Workspace: lista de missas + resumo */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Missas disponiveis</h2>
                    <p className="text-sm text-gray-500">
                        Selecione os cards para montar o relatorio consolidado.
                    </p>
                </div>

                {/* Layout: desktop = 2 colunas | mobile = coluna unica (lista -> resumo) */}
                <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="grid gap-3">
                        {masses.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-8 text-center text-sm text-gray-500">
                                Nenhuma missa encontrada para os filtros selecionados.
                            </div>
                        ) : (
                            masses.map((mass) => {
                                const isSelected = selectedIds.includes(mass.id);

                                return (
                                    <button
                                        key={mass.id}
                                        type="button"
                                        onClick={() => toggleSelection(mass.id)}
                                        className={`rounded-2xl border p-4 text-left transition-all ${
                                            isSelected
                                                ? 'border-[#6d7749] bg-[#6d7749]/5 shadow-md'
                                                : 'border-gray-200 bg-white shadow-sm hover:border-[#6d7749]/40 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {formatDateToBR(mass.dateLabel)} as {mass.timeLabel}
                                                </h3>
                                                <p className="text-sm text-gray-500">{mass.type}</p>
                                                {mass.description && (
                                                    <p className="mt-2 line-clamp-2 text-sm text-gray-700">
                                                        {mass.description}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                isSelected ? 'bg-[#6d7749] text-white' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {isSelected ? 'Selecionada' : 'Selecionar'}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {mass.roles.map((role) => (
                                                <span
                                                    key={`${mass.id}-${role.roleName}`}
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                        role.status === 'complete'
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : role.status === 'partial'
                                                                ? 'bg-amber-50 text-amber-700'
                                                                : 'bg-rose-50 text-rose-700'
                                                    }`}
                                                >
                                                    {role.roleName}: {role.filledQty}/{role.expectedQty}
                                                </span>
                                            ))}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Resumo — sticky no desktop, inline no mobile */}
                    <div className="lg:sticky lg:top-6 lg:self-start">
                        <ReportPreview reports={selectedReports} />

                        {/* CTA PDF secundario — apenas mobile, abaixo do resumo */}
                        {selectedIds.length > 0 && (
                            <div className="mt-4 lg:hidden">
                                <button
                                    type="button"
                                    disabled={pdfLoading}
                                    onClick={handlePdfExport}
                                    className="w-full rounded-xl bg-[#6d7749] px-4 py-3 text-sm font-semibold text-white hover:bg-[#5d6541] disabled:opacity-60"
                                >
                                    {pdfLoading ? 'Gerando PDF...' : 'Exportar PDF'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
