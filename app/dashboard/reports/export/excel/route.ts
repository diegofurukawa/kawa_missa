import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getMassReportsByIds } from '@/lib/data';
import { formatDateToBR } from '@/lib/date-utils';

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
}

export async function GET(request: Request) {
    const session = await auth();

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { tenantId: true }
    });

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ids = (searchParams.get('ids') || '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

    if (ids.length === 0) {
        return NextResponse.json(
            { error: 'Nenhuma missa selecionada para exportacao.' },
            { status: 400 }
        );
    }

    const reports = await getMassReportsByIds(user.tenantId, ids);

    const rows = reports.flatMap((report) =>
        report.roles.map((role) => `
            <tr>
                <td>${escapeHtml(formatDateToBR(report.dateLabel))}</td>
                <td>${escapeHtml(report.timeLabel)}</td>
                <td>${escapeHtml(report.type)}</td>
                <td>${escapeHtml(report.description || '')}</td>
                <td>${escapeHtml(role.roleName)}</td>
                <td>${role.expectedQty}</td>
                <td>${escapeHtml(role.filledNames.join(', '))}</td>
                <td>${role.filledQty}</td>
                <td>${role.pendingQty}</td>
                <td>${escapeHtml(role.status)}</td>
            </tr>
        `)
    ).join('');

    const content = `<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
    </head>
    <body>
        <table border="1">
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Tipo</th>
                    <th>Descricao</th>
                    <th>Role</th>
                    <th>Quantidade Esperada</th>
                    <th>Participantes</th>
                    <th>Quantidade Preenchida</th>
                    <th>Pendentes</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    </body>
</html>`;

    return new NextResponse(`\uFEFF${content}`, {
        headers: {
            'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
            'Content-Disposition': 'attachment; filename="relatorio-missas.xls"',
        }
    });
}



