import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getMassReportsByIds } from '@/lib/data';
import { formatDateToBR, formatLocalDateTime } from '@/lib/date-utils';
import type { MassReportSummary, ReportRoleSummary } from '@/lib/report-utils';
import PDFDocument from 'pdfkit';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
    primary:    '#6d7749',
    gray900:    '#111827',
    gray700:    '#374151',
    gray500:    '#6b7280',
    gray200:    '#e5e7eb',
    emerald:    '#065f46',
    amber:      '#92400e',
    rose:       '#9f1239',
    bgLight:    '#f6f5f8',
    white:      '#ffffff',
    // Badge backgrounds
    emeraldBg:  '#d1fae5',
    amberBg:    '#fef3c7',
    roseBg:     '#ffe4e6',
    // Component fills
    pillBg:     '#eef0e8',
    roleBg:     '#f9fafb',
    cardBorder: '#e5e7eb',
    pillText:   '#5d6541',
};

const MARGIN        = 50;
const PAGE_WIDTH    = 595.28; // A4
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const CARD_PADDING = 14;
const CARD_RADIUS  = 8;
const ROLE_RADIUS  = 6;
const BADGE_RADIUS = 8;
const STATS_BOX_W  = 130;
const ROLE_COL_GAP = 8;
const ROLE_COL_W   = (CONTENT_WIDTH - 2 * CARD_PADDING - ROLE_COL_GAP) / 2;
const PILL_H       = 14;
const PILL_PAD_X   = 6;
const PILL_GAP     = 4;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusColors(status: ReportRoleSummary['status']): { bg: string; text: string } {
    if (status === 'complete') return { bg: COLORS.emeraldBg, text: COLORS.emerald };
    if (status === 'partial')  return { bg: COLORS.amberBg,   text: COLORS.amber };
    return                            { bg: COLORS.roseBg,    text: COLORS.rose };
}

function getRoleStatusLabel(role: ReportRoleSummary): string {
    if (role.isExtra)               return 'Extra';
    if (role.status === 'complete') return 'Completo';
    if (role.status === 'partial')  return 'Pendente';
    return 'Vazio';
}

function estimateRoleHeight(role: ReportRoleSummary): number {
    const innerWidth  = ROLE_COL_W - 2 * CARD_PADDING;
    const headerRow   = 16;
    const subtextRow  = 14;

    let pillRows: number;
    if (role.filledNames.length === 0) {
        pillRows = 16;
    } else {
        const avgPillW    = 72; // conservative at 8pt
        const pillsPerRow = Math.max(1, Math.floor(innerWidth / (avgPillW + PILL_GAP)));
        pillRows = Math.ceil(role.filledNames.length / pillsPerRow) * (PILL_H + PILL_GAP);
    }

    return CARD_PADDING * 2 + headerRow + subtextRow + pillRows + 8;
}

// ─── Role Block ───────────────────────────────────────────────────────────────

function addRoleBlock(
    doc: PDFKit.PDFDocument,
    role: ReportRoleSummary,
    x: number,
    y: number,
    width: number
): void {
    const blockH    = estimateRoleHeight(role);
    const colors    = statusColors(role.status);
    const label     = getRoleStatusLabel(role);
    const innerLeft = x + CARD_PADDING;
    const innerW    = width - 2 * CARD_PADDING;
    let   cursorY   = y + CARD_PADDING;

    // Role block background + border
    doc.roundedRect(x, y, width, blockH, ROLE_RADIUS)
        .fillColor(COLORS.roleBg)
        .fill();
    doc.roundedRect(x, y, width, blockH, ROLE_RADIUS)
        .strokeColor(COLORS.cardBorder)
        .lineWidth(0.5)
        .stroke();

    // Measure badge width first (uses bold font)
    const badgeText = `${label} (${role.filledQty}/${role.expectedQty})`;
    doc.font('Helvetica-Bold').fontSize(8);
    const badgeW    = doc.widthOfString(badgeText) + PILL_PAD_X * 2;
    const badgeLeft = x + width - CARD_PADDING - badgeW;

    // Status badge background + text
    doc.roundedRect(badgeLeft, cursorY - 2, badgeW, PILL_H + 2, BADGE_RADIUS)
        .fillColor(colors.bg)
        .fill();
    doc.fillColor(colors.text)
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(badgeText, badgeLeft + PILL_PAD_X, cursorY, {
            width:     badgeW - PILL_PAD_X * 2,
            lineBreak: false,
        });

    // Role name (fills remaining width)
    const nameW = Math.max(10, innerW - badgeW - 8);
    doc.fillColor(COLORS.gray900)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(role.roleName, innerLeft, cursorY, {
            width:     nameW,
            lineBreak: false,
            ellipsis:  true,
        });

    cursorY += 16;

    // Subtext
    const pendingPart = role.pendingQty > 0
        ? ` • ${role.pendingQty} pendente${role.pendingQty === 1 ? '' : 's'}`
        : '';
    doc.fillColor(COLORS.gray500)
        .font('Helvetica')
        .fontSize(8)
        .text(
            `${role.filledQty}/${role.expectedQty} preenchidos${pendingPart}`,
            innerLeft, cursorY,
            { width: innerW }
        );

    cursorY += 14;

    // Participant pills
    if (role.filledNames.length > 0) {
        let pillX = innerLeft;
        let pillY = cursorY;

        for (const name of role.filledNames) {
            doc.font('Helvetica').fontSize(8);
            const pillW = doc.widthOfString(name) + PILL_PAD_X * 2;

            if (pillX + pillW > innerLeft + innerW) {
                pillX  = innerLeft;
                pillY += PILL_H + PILL_GAP;
            }

            doc.roundedRect(pillX, pillY, pillW, PILL_H, 6)
                .fillColor(COLORS.pillBg)
                .fill();

            doc.fillColor(COLORS.pillText)
                .font('Helvetica')
                .fontSize(8)
                .text(name, pillX + PILL_PAD_X, pillY + 3, { lineBreak: false });

            pillX += pillW + PILL_GAP;
        }
    } else {
        doc.fillColor(COLORS.gray500)
            .font('Helvetica-Oblique')
            .fontSize(8)
            .text('Nenhum participante preenchido.', innerLeft, cursorY, { width: innerW });
    }
}

// ─── Role Grid (2 colunas) ────────────────────────────────────────────────────

function addRoleBlocksGrid(
    doc: PDFKit.PDFDocument,
    roles: ReportRoleSummary[],
    contentLeft: number
): void {
    for (let i = 0; i < roles.length; i += 2) {
        const leftRole  = roles[i];
        const rightRole = roles[i + 1];

        const rowH = Math.max(
            estimateRoleHeight(leftRole),
            rightRole ? estimateRoleHeight(rightRole) : 0
        ) + 6;

        if (doc.y + rowH > doc.page.height - MARGIN) {
            doc.addPage();
            doc.y = MARGIN;
        }

        const rowTop = doc.y;

        addRoleBlock(doc, leftRole, contentLeft, rowTop, ROLE_COL_W);

        if (rightRole) {
            addRoleBlock(
                doc, rightRole,
                contentLeft + ROLE_COL_W + ROLE_COL_GAP,
                rowTop, ROLE_COL_W
            );
        }

        doc.y = rowTop + rowH;
    }
}

// ─── Mass Block (card) ────────────────────────────────────────────────────────

function addMassBlock(doc: PDFKit.PDFDocument, report: MassReportSummary): void {
    const contentLeft  = MARGIN + CARD_PADDING;
    const contentRight = MARGIN + CONTENT_WIDTH - CARD_PADDING;
    const headerColW   = CONTENT_WIDTH - 2 * CARD_PADDING - STATS_BOX_W - 10;

    // Pre-emptive page break: if the whole card fits in one page but doesn't fit here
    let rolesEstimate = 0;
    for (let i = 0; i < report.roles.length; i += 2) {
        const left  = report.roles[i];
        const right = report.roles[i + 1];
        rolesEstimate += Math.max(
            estimateRoleHeight(left),
            right ? estimateRoleHeight(right) : 0
        ) + 6;
    }
    const totalEstimate = CARD_PADDING * 2 + 60 + 10 + rolesEstimate + CARD_PADDING;
    const pageH = doc.page.height;

    if (
        totalEstimate <= pageH - MARGIN * 2 &&
        doc.y + totalEstimate > pageH - MARGIN
    ) {
        doc.addPage();
    }

    const cardTop = doc.y;
    doc.y = cardTop + CARD_PADDING;

    // ── Mass header (left column) ──
    doc.fillColor(COLORS.gray900)
        .font('Helvetica-Bold')
        .fontSize(13)
        .text(
            `${formatDateToBR(report.dateLabel)} às ${report.timeLabel}`,
            contentLeft, doc.y,
            { width: headerColW }
        );

    doc.moveDown(0.2);

    doc.fillColor(COLORS.gray500)
        .font('Helvetica')
        .fontSize(9)
        .text(
            `${report.type}${report.slug ? ' • ' + report.slug : ''}`,
            contentLeft, doc.y,
            { width: headerColW }
        );

    if (report.description) {
        doc.moveDown(0.2);
        doc.fillColor(COLORS.gray700)
            .font('Helvetica')
            .fontSize(9)
            .text(report.description, contentLeft, doc.y, { width: headerColW });
    }

    const headerBottomY = doc.y + 4;

    // ── Stats box (right column, absolute position) ──
    const statsLeft = MARGIN + CONTENT_WIDTH - CARD_PADDING - STATS_BOX_W;
    const statsTop  = cardTop + CARD_PADDING;

    doc.roundedRect(statsLeft, statsTop, STATS_BOX_W, 46, 6)
        .fillColor(COLORS.bgLight)
        .fill();

    doc.fillColor(COLORS.gray700)
        .font('Helvetica')
        .fontSize(8)
        .text(`${report.totalFilled} preenchidos`,
            statsLeft + 8, statsTop + 6,  { width: STATS_BOX_W - 16 })
        .text(`${report.totalPending} pendentes`,
            statsLeft + 8, statsTop + 18, { width: STATS_BOX_W - 16 })
        .text(`${report.completedRoles}/${report.totalRoles} roles completos`,
            statsLeft + 8, statsTop + 30, { width: STATS_BOX_W - 16 });

    const statsBottomY = statsTop + 46 + 6;

    // Advance cursor below the taller of the two columns
    doc.y = Math.max(headerBottomY, statsBottomY) + 4;

    // ── Divider ──
    doc.moveTo(contentLeft, doc.y)
        .lineTo(contentRight, doc.y)
        .strokeColor(COLORS.gray200)
        .lineWidth(0.5)
        .stroke();

    doc.y += 8;

    // ── Role grid ──
    addRoleBlocksGrid(doc, report.roles, contentLeft);

    doc.y += CARD_PADDING;

    // ── Card border (retroactive) ──
    const cardHeight = doc.y - cardTop;
    doc.roundedRect(MARGIN, cardTop, CONTENT_WIDTH, cardHeight, CARD_RADIUS)
        .strokeColor(COLORS.cardBorder)
        .lineWidth(0.75)
        .stroke();
}

// ─── Document Header ──────────────────────────────────────────────────────────

function addDocumentHeader(doc: PDFKit.PDFDocument, reports: MassReportSummary[]) {
    doc.fillColor(COLORS.primary)
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Relatorio de Missas', MARGIN, MARGIN, { width: CONTENT_WIDTH });

    doc.moveDown(0.4);

    doc.fillColor(COLORS.gray500)
        .fontSize(10)
        .font('Helvetica')
        .text(
            `${reports.length} ${reports.length === 1 ? 'missa selecionada' : 'missas selecionadas'}`,
            { width: CONTENT_WIDTH }
        );

    doc.moveDown(0.8);

    doc.moveTo(MARGIN, doc.y)
        .lineTo(MARGIN + CONTENT_WIDTH, doc.y)
        .strokeColor(COLORS.gray200)
        .lineWidth(1)
        .stroke();

    doc.moveDown(1);
}

// ─── Page Numbers ─────────────────────────────────────────────────────────────

function addPageNumbers(doc: PDFKit.PDFDocument) {
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fillColor(COLORS.gray500)
            .fontSize(8)
            .font('Helvetica')
            .text(
                `Pagina ${i + 1} de ${totalPages}`,
                MARGIN,
                doc.page.height - MARGIN - 10,
                { width: CONTENT_WIDTH, align: 'right' }
            );
    }
}

// ─── PDF Builder ──────────────────────────────────────────────────────────────

function buildPdf(reports: MassReportSummary[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
            autoFirstPage: false,
            bufferPages: true,
            info: {
                Title:  'Relatorio de Missas',
                Author: 'Kawa Missa',
            },
        });

        const chunks: Buffer[] = [];
        doc.on('data',  (chunk: Buffer) => chunks.push(chunk));
        doc.on('end',   () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.addPage();
        addDocumentHeader(doc, reports);

        reports.forEach((report, idx) => {
            if (idx > 0) doc.moveDown(1.5);
            addMassBlock(doc, report);
        });

        addPageNumbers(doc);
        doc.end();
    });
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(request: Request) {
    const session = await auth();

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where:  { email: session.user.email },
        select: { tenantId: true },
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

    // tenantId always derived from session — never from query
    const reports = await getMassReportsByIds(user.tenantId, ids);

    if (reports.length === 0) {
        return NextResponse.json(
            { error: 'Nenhuma missa valida encontrada para o tenant autenticado.' },
            { status: 404 }
        );
    }

    const pdfBuffer = await buildPdf(reports);

    const filename = `relatorio-missas-${formatLocalDateTime(new Date()).date}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
        headers: {
            'Content-Type':        'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length':      String(pdfBuffer.length),
        },
    });
}
