import {
    buildParticipantWarningMessage,
    normalizeParticipantInput,
    normalizeStoredParticipants,
    parseParticipantsFromFormData,
} from '@/lib/participant-utils';

describe('participant-utils', () => {
    it('splits participant input by comma, semicolon and newline', () => {
        expect(normalizeParticipantInput('Diego, Maria; Ana\nJoao')).toEqual([
            'Diego',
            'Maria',
            'Ana',
            'Joao',
        ]);
    });

    it('deduplicates repeated names by default', () => {
        expect(normalizeParticipantInput('Diego, diego, Diego')).toEqual(['Diego']);
    });

    it('caps parsed participants by role limit and produces warnings', () => {
        const formData = new FormData();
        formData.append('role_Ministro', 'Diego, Maria, Ana');

        const result = parseParticipantsFromFormData(formData, { Ministro: 2 });

        expect(result.participants).toEqual({ Ministro: ['Diego', 'Maria'] });
        expect(result.warnings).toEqual([
            {
                role: 'Ministro',
                ignoredCount: 1,
                acceptedCount: 2,
                limit: 2,
            }
        ]);
    });

    it('normalizes stored legacy participants', () => {
        const result = normalizeStoredParticipants({
            Ministro: ['Diego, Maria'],
            Cantor: 'Ana; Joao',
        });

        expect(result.participants).toEqual({
            Ministro: ['Diego', 'Maria'],
            Cantor: ['Ana', 'Joao'],
        });
    });

    it('builds a user-facing warning message', () => {
        const message = buildParticipantWarningMessage([
            {
                role: 'Ministro',
                ignoredCount: 2,
                acceptedCount: 2,
                limit: 2,
            }
        ]);

        expect(message).toBe('2 nomes excederam o limite de 2 para Ministro e foram ignorados.');
    });
});
