import * as parser from 'cron-parser';

/**
 * Calcula as próximas N datas válidas a partir de uma expressão CRON
 * @param cronExpression Expressão CRON (formato: min hour day month weekday)
 * @param count Número de datas a retornar (padrão: 10)
 * @param startDate Data inicial para começar a busca (padrão: agora)
 * @returns Array de objetos Date com as próximas datas válidas
 */
export function getNextValidDates(
    cronExpression: string,
    count: number = 10,
    startDate: Date = new Date()
): Date[] {
    try {
        const interval = parser.parseExpression(cronExpression, {
            currentDate: startDate,
            tz: 'America/Sao_Paulo', // Timezone do Brasil
        });

        const dates: Date[] = [];
        for (let i = 0; i < count; i++) {
            try {
                const nextDate = interval.next();
                dates.push(nextDate.toDate());
            } catch (error) {
                // Não há mais datas válidas
                break;
            }
        }

        return dates;
    } catch (error) {
        console.error('Erro ao parsear expressão CRON:', error);
        return [];
    }
}

/**
 * Valida se uma data/hora corresponde ao padrão CRON
 * @param cronExpression Expressão CRON
 * @param date Data/hora a validar
 * @returns true se a data corresponde ao padrão CRON
 */
export function isValidCronDate(cronExpression: string, date: Date): boolean {
    try {
        const interval = parser.parseExpression(cronExpression, {
            currentDate: date,
            tz: 'America/Sao_Paulo',
        });

        // Pega a próxima data válida
        const nextDate = interval.next().toDate();
        
        // Compara se a data fornecida corresponde à próxima data válida
        // Consideramos válida se a diferença for menor que 1 minuto (para tolerar pequenas diferenças)
        const diff = Math.abs(nextDate.getTime() - date.getTime());
        return diff < 60000; // 1 minuto em milissegundos
    } catch (error) {
        console.error('Erro ao validar data CRON:', error);
        return false;
    }
}

/**
 * Verifica se uma data/hora está próxima de uma data válida do CRON (dentro de 1 minuto)
 * Útil para validar se o usuário selecionou uma data que corresponde ao padrão
 * @param cronExpression Expressão CRON
 * @param date Data/hora a verificar
 * @returns true se a data está próxima de uma data válida
 */
export function isNearValidCronDate(cronExpression: string, date: Date): boolean {
    try {
        // Busca as próximas 5 datas válidas
        const validDates = getNextValidDates(cronExpression, 5, new Date(date.getTime() - 86400000)); // Começa 1 dia antes
        
        // Verifica se alguma das datas válidas está próxima (dentro de 1 minuto)
        return validDates.some(validDate => {
            const diff = Math.abs(validDate.getTime() - date.getTime());
            return diff < 60000; // 1 minuto
        });
    } catch (error) {
        console.error('Erro ao verificar data próxima do CRON:', error);
        return false;
    }
}

/**
 * Formata uma expressão CRON para uma descrição legível
 * @param cronExpression Expressão CRON
 * @returns Descrição legível da expressão
 */
export function formatCronDescription(cronExpression: string): string {
    const parts = cronExpression.trim().split(/\s+/);
    if (parts.length !== 5) {
        return cronExpression;
    }

    const [minute, hour, day, month, weekday] = parts;
    
    const hourStr = String(hour).padStart(2, '0');
    const minuteStr = String(minute).padStart(2, '0');
    const timeStr = `${hourStr}:${minuteStr}`;

    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    if (day === '*' && month === '*' && weekday !== '*') {
        if (weekday.includes(',')) {
            const days = weekday.split(',').map(d => weekdays[parseInt(d)]).join(', ');
            return `Toda(s) ${days} às ${timeStr}`;
        } else {
            const dayName = weekdays[parseInt(weekday)] || '';
            return `Toda ${dayName} às ${timeStr}`;
        }
    } else if (day === '*' && month === '*' && weekday === '*') {
        return `Todo dia às ${timeStr}`;
    } else if (day !== '*' && month === '*' && weekday === '*') {
        return `Todo dia ${day} às ${timeStr}`;
    }

    return cronExpression;
}

