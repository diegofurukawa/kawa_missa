import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getMassReportsByIds } from '@/lib/data';
import ReportPreview from '@/app/ui/reports/report-preview';
import PrintButton from '@/app/ui/reports/print-button';

interface PrintPageProps {
    searchParams: Promise<{ ids?: string; mode?: string }>;
}

export default async function ReportsPrintPage({ searchParams }: PrintPageProps) {
    const session = await auth();

    if (!session?.user?.email) {
        return <div className="p-8 text-sm text-gray-600">Nao autorizado.</div>;
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { tenantId: true }
    });

    if (!user) {
        return <div className="p-8 text-sm text-gray-600">Usuario nao encontrado.</div>;
    }

    const resolvedSearchParams = await searchParams;
    const massIds = (resolvedSearchParams.ids || '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

    const reports = await getMassReportsByIds(user.tenantId, massIds);

    return (
        <div className="bg-white p-6 print:p-0">
            <div className="mx-auto max-w-5xl space-y-6 print:max-w-none">
                <div className="rounded-2xl border border-gray-200 bg-[#f6f5f8] p-4 print:hidden">
                    <h1 className="text-xl font-semibold text-gray-900">Modo de impressao</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Use o dialogo do navegador para imprimir este relatorio.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <PrintButton />
                        <Link
                            href="/dashboard/reports"
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Voltar para relatorios
                        </Link>
                    </div>
                </div>

                <ReportPreview
                    reports={reports}
                    title="Relatorio consolidado"
                    emptyMessage="Nenhuma missa foi selecionada para exportacao."
                />
            </div>
        </div>
    );
}
