import { formatDateToBR } from '@/lib/date-utils';
import type { MassReportSummary, ReportRoleSummary } from '@/lib/report-utils';

function getRoleStatusClasses(status: ReportRoleSummary['status']) {
    if (status === 'complete') {
        return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    }

    if (status === 'partial') {
        return 'border-amber-200 bg-amber-50 text-amber-800';
    }

    return 'border-rose-200 bg-rose-50 text-rose-800';
}

function getRoleStatusLabel(role: ReportRoleSummary) {
    if (role.isExtra) return 'Extra';
    if (role.status === 'complete') return 'Completo';
    if (role.status === 'partial') return 'Pendente';
    return 'Vazio';
}

interface ReportPreviewProps {
    reports: MassReportSummary[];
    title?: string;
    emptyMessage?: string;
}

export default function ReportPreview({
    reports,
    title = 'Resumo selecionado',
    emptyMessage = 'Selecione uma ou mais missas para visualizar o relatorio.',
}: ReportPreviewProps) {
    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">
                    {reports.length === 0
                        ? emptyMessage
                        : `${reports.length} ${reports.length === 1 ? 'missa selecionada' : 'missas selecionadas'}`}
                </p>
            </div>

            {reports.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-8 text-center text-sm text-gray-500">
                    {emptyMessage}
                </div>
            ) : (
                <div className="space-y-4">
                    {reports.map((report) => (
                        <article key={report.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {formatDateToBR(report.dateLabel)} as {report.timeLabel}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {report.type} • {report.slug}
                                    </p>
                                    {report.description && (
                                        <p className="mt-2 max-w-3xl text-sm text-gray-700">{report.description}</p>
                                    )}
                                </div>
                                <div className="rounded-xl bg-[#f6f5f8] px-4 py-3 text-sm text-gray-700">
                                    <div>{report.totalFilled} preenchidos</div>
                                    <div>{report.totalPending} pendentes</div>
                                    <div>{report.completedRoles}/{report.totalRoles} roles completos</div>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                {report.roles.map((role) => (
                                    <section key={`${report.id}-${role.roleName}`} className="rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{role.roleName}</h4>
                                                <p className="text-sm text-gray-500">
                                                    {role.filledQty}/{role.expectedQty} preenchidos
                                                    {role.pendingQty > 0 ? ` • ${role.pendingQty} pendente${role.pendingQty === 1 ? '' : 's'}` : ''}
                                                </p>
                                            </div>
                                            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getRoleStatusClasses(role.status)}`}>
                                                {getRoleStatusLabel(role)}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {role.filledNames.length > 0 ? (
                                                role.filledNames.map((name) => (
                                                    <span
                                                        key={`${report.id}-${role.roleName}-${name}`}
                                                        className="rounded-full bg-[#6d7749]/10 px-3 py-1 text-xs font-medium text-[#5d6541]"
                                                    >
                                                        {name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-400">Nenhum participante preenchido.</span>
                                            )}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
