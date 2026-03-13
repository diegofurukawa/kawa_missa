import { formatLocalDateTime } from '@/lib/date-utils';
import { normalizeStoredParticipants } from '@/lib/participant-utils';

export type RoleReportStatus = 'complete' | 'partial' | 'empty';

export interface ReportRoleSummary {
    roleName: string;
    expectedQty: number;
    filledNames: string[];
    filledQty: number;
    pendingQty: number;
    status: RoleReportStatus;
    isExtra?: boolean;
}

export interface MassReportSummary {
    id: string;
    slug: string;
    date: Date;
    dateLabel: string;
    timeLabel: string;
    type: string;
    description: string | null;
    roles: ReportRoleSummary[];
    totalExpected: number;
    totalFilled: number;
    totalPending: number;
    completedRoles: number;
    totalRoles: number;
}

interface ParticipantConfigShape {
    roles?: [string, number][];
}

interface BuildMassReportParams {
    id: string;
    slug: string;
    date: Date;
    type?: string | null;
    description?: string | null;
    participants: unknown;
    participantConfig?: ParticipantConfigShape | null;
}

export function buildRoleLimitMap(participantConfig?: ParticipantConfigShape | null): Record<string, number> {
    return Object.fromEntries((participantConfig?.roles || []).map(([roleName, limit]) => [roleName, limit]));
}

export function buildMassReportSummary({
    id,
    slug,
    date,
    type,
    description,
    participants,
    participantConfig,
}: BuildMassReportParams): MassReportSummary {
    const roleLimitMap = buildRoleLimitMap(participantConfig);
    const normalizedParticipants = normalizeStoredParticipants(participants, roleLimitMap).participants;

    const configuredRoles = participantConfig?.roles || [];
    const extraRoles = Object.keys(normalizedParticipants).filter((roleName) => !(roleName in roleLimitMap));

    const roles: ReportRoleSummary[] = [
        ...configuredRoles.map<ReportRoleSummary>(([roleName, expectedQty]) => {
            const filledNames = normalizedParticipants[roleName] || [];
            const filledQty = filledNames.length;
            const pendingQty = Math.max(expectedQty - filledQty, 0);

            return {
                roleName,
                expectedQty,
                filledNames,
                filledQty,
                pendingQty,
                status: filledQty === 0 ? 'empty' : pendingQty > 0 ? 'partial' : 'complete',
            };
        }),
        ...extraRoles.map<ReportRoleSummary>((roleName) => {
            const filledNames = normalizedParticipants[roleName] || [];
            const filledQty = filledNames.length;

            return {
                roleName,
                expectedQty: filledQty,
                filledNames,
                filledQty,
                pendingQty: 0,
                status: filledQty === 0 ? 'empty' : 'complete',
                isExtra: true,
            };
        }),
    ];

    const { date: dateLabel, time: timeLabel } = formatLocalDateTime(date);
    const totalExpected = roles.reduce((sum, role) => sum + role.expectedQty, 0);
    const totalFilled = roles.reduce((sum, role) => sum + role.filledQty, 0);
    const totalPending = roles.reduce((sum, role) => sum + role.pendingQty, 0);
    const completedRoles = roles.filter((role) => role.status === 'complete').length;

    return {
        id,
        slug,
        date,
        dateLabel,
        timeLabel,
        type: type || 'Missa',
        description: description || null,
        roles,
        totalExpected,
        totalFilled,
        totalPending,
        completedRoles,
        totalRoles: roles.length,
    };
}
