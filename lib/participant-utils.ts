export interface ParticipantParseWarning {
    role: string;
    ignoredCount: number;
    acceptedCount: number;
    limit: number;
}

function splitRawParticipantInput(value: string): string[] {
    return value
        .split(/[;,\n\r]+/)
        .map((item) => item.trim())
        .filter(Boolean);
}

export function normalizeParticipantNames(values: string[], allowDuplicates = false): string[] {
    const normalized: string[] = [];
    const seen = new Set<string>();

    values.forEach((value) => {
        splitRawParticipantInput(value).forEach((item) => {
            const dedupeKey = item.toLocaleLowerCase('pt-BR');
            if (!allowDuplicates) {
                if (seen.has(dedupeKey)) {
                    return;
                }
                seen.add(dedupeKey);
            }
            normalized.push(item);
        });
    });

    return normalized;
}

export function normalizeParticipantInput(value: string, allowDuplicates = false): string[] {
    return normalizeParticipantNames([value], allowDuplicates);
}

export function parseParticipantsFromFormData(
    formData: FormData,
    limits?: Record<string, number>
): { participants: Record<string, string[]>; warnings: ParticipantParseWarning[] } {
    const groupedValues: Record<string, string[]> = {};

    formData.forEach((value, key) => {
        if (!key.startsWith('role_')) return;

        const roleName = key.replace('role_', '');
        const rawValue = value.toString().trim();
        if (!rawValue) return;

        if (!groupedValues[roleName]) {
            groupedValues[roleName] = [];
        }

        groupedValues[roleName].push(rawValue);
    });

    const participants: Record<string, string[]> = {};
    const warnings: ParticipantParseWarning[] = [];

    Object.entries(groupedValues).forEach(([role, values]) => {
        const normalized = normalizeParticipantNames(values);
        const limit = limits?.[role];

        if (typeof limit === 'number') {
            const accepted = normalized.slice(0, limit);
            const ignoredCount = Math.max(normalized.length - accepted.length, 0);
            participants[role] = accepted;

            if (ignoredCount > 0) {
                warnings.push({
                    role,
                    ignoredCount,
                    acceptedCount: accepted.length,
                    limit,
                });
            }

            return;
        }

        participants[role] = normalized;
    });

    return { participants, warnings };
}

export function normalizeStoredParticipants(
    participants: unknown,
    limits?: Record<string, number>
): { participants: Record<string, string[]>; warnings: ParticipantParseWarning[] } {
    if (!participants || typeof participants !== 'object' || Array.isArray(participants)) {
        return { participants: {}, warnings: [] };
    }

    const normalized: Record<string, string[]> = {};
    const warnings: ParticipantParseWarning[] = [];

    Object.entries(participants as Record<string, unknown>).forEach(([role, value]) => {
        const rawValues = Array.isArray(value)
            ? value.map((item) => String(item))
            : typeof value === 'string'
                ? [value]
                : [];

        const normalizedValues = normalizeParticipantNames(rawValues);
        const limit = limits?.[role];

        if (typeof limit === 'number') {
            const accepted = normalizedValues.slice(0, limit);
            const ignoredCount = Math.max(normalizedValues.length - accepted.length, 0);
            normalized[role] = accepted;

            if (ignoredCount > 0) {
                warnings.push({
                    role,
                    ignoredCount,
                    acceptedCount: accepted.length,
                    limit,
                });
            }

            return;
        }

        normalized[role] = normalizedValues;
    });

    return { participants: normalized, warnings };
}

export function buildParticipantWarningMessage(warnings: ParticipantParseWarning[]): string | null {
    if (warnings.length === 0) return null;

    return warnings
        .map(({ role, ignoredCount, limit }) => {
            const ignoredLabel = ignoredCount === 1 ? 'nome excedeu' : 'nomes excederam';
            return `${ignoredCount} ${ignoredLabel} o limite de ${limit} para ${role} e foram ignorados.`;
        })
        .join(' ');
}
