/**
 * Utilitários para manipulação de datas/horas sempre em hora local
 * Garante que não há conversão de timezone indesejada
 */

/**
 * Converte um objeto Date para string no formato local (YYYY-MM-DDTHH:mm)
 * Sem timezone, tratando como hora local
 * @param date Objeto Date
 * @returns String no formato YYYY-MM-DDTHH:mm
 */
export function toLocalDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Converte uma string local (YYYY-MM-DDTHH:mm) para Date
 * Trata a string como hora local, sem conversão de timezone
 * IMPORTANTE: Cria um Date que quando salvo no PostgreSQL mantém a hora local
 * @param str String no formato YYYY-MM-DDTHH:mm (sem timezone)
 * @returns Objeto Date em hora local
 */
export function fromLocalDateTime(str: string): Date {
    // Remove qualquer timezone que possa estar presente
    const cleanStr = str.replace(/[+-]\d{2}:\d{2}$/, '').replace(/Z$/, '');

    // Parse da string
    const [datePart, timePart] = cleanStr.split('T');
    if (!datePart || !timePart) {
        throw new Error('Formato de data inválido. Use YYYY-MM-DDTHH:mm');
    }

    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    // CORREÇÃO: Usar o construtor Date com parâmetros locais
    // Isso cria um Date que representa a hora local, não UTC
    // Quando o PostgreSQL receber este Date, ele irá armazenar corretamente
    const date = new Date(year, month - 1, day, hours, minutes || 0, 0, 0);

    return date;
}

/**
 * Formata um Date para inputs separados de data e hora
 * @param date Objeto Date
 * @returns Objeto com date (YYYY-MM-DD) e time (HH:mm)
 */
export function formatLocalDateTime(date: Date): { date: string; time: string } {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return {
        date: `${year}-${month}-${day}`,
        time: `${hours}:${minutes}`,
    };
}

/**
 * Combina data e hora locais em uma string ISO local
 * @param dateStr String no formato YYYY-MM-DD
 * @param timeStr String no formato HH:mm
 * @returns String no formato YYYY-MM-DDTHH:mm
 */
export function combineLocalDateTime(dateStr: string, timeStr: string): string {
    return `${dateStr}T${timeStr}`;
}

/**
 * Converte um Date do banco (UTC) para hora local para exibição
 * PostgreSQL armazena em UTC, então precisamos converter para local
 * @param utcDate Date vindo do banco (assumido como UTC)
 * @returns Date em hora local
 */
export function utcToLocal(utcDate: Date): Date {
    // O Date do JavaScript já trata como local quando criado a partir de string UTC
    // Mas para garantir, vamos criar um novo Date com os valores locais
    return new Date(utcDate.getTime() + (utcDate.getTimezoneOffset() * 60000));
}

/**
 * Converte um Date local para UTC para salvar no banco
 * @param localDate Date em hora local
 * @returns Date em UTC (para salvar no banco)
 */
export function localToUtc(localDate: Date): Date {
    // Cria um novo Date que será interpretado como UTC
    // Mas na verdade, vamos apenas garantir que o valor está correto
    // PostgreSQL vai armazenar corretamente se passarmos um Date válido
    return new Date(localDate.toISOString());
}

/**
 * Cria um Date a partir de valores locais sem conversão de timezone
 * Útil para criar datas a partir de inputs do usuário
 * @param year Ano
 * @param month Mês (1-12)
 * @param day Dia
 * @param hours Hora (0-23)
 * @param minutes Minuto (0-59)
 * @returns Date criado com valores locais
 */
export function createLocalDate(
    year: number,
    month: number,
    day: number,
    hours: number = 0,
    minutes: number = 0
): Date {
    // Usar construtor com parâmetros para criar Date em hora local
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

/**
 * Converte YYYY-MM-DD para formato pt-BR (dd/MM/yyyy)
 * @param dateStr String no formato YYYY-MM-DD
 * @returns String no formato dd/MM/yyyy ou string vazia se inválido
 */
export function formatDateToBR(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return '';
    return `${day}/${month}/${year}`;
}

/**
 * Converte formato pt-BR (dd/MM/yyyy) para YYYY-MM-DD
 * @param brDateStr String no formato dd/MM/yyyy
 * @returns String no formato YYYY-MM-DD ou null se inválido
 */
export function parseDateFromBR(brDateStr: string): string | null {
    if (!brDateStr) return null;

    // Remove caracteres não numéricos, exceto barras
    const cleaned = brDateStr.replace(/[^\d/]/g, '');
    const parts = cleaned.split('/').filter(Boolean);

    if (parts.length < 3) return null;

    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];

    // Validação básica
    if (day.length !== 2 || month.length !== 2 || year.length !== 4) {
        return null;
    }

    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    // Validação de valores
    if (monthNum < 1 || monthNum > 12) return null;
    if (dayNum < 1 || dayNum > 31) return null;
    if (yearNum < 1900 || yearNum > 2100) return null;

    // Validar se a data é válida (ex: 31/02 não existe)
    const date = new Date(yearNum, monthNum - 1, dayNum);
    if (
        date.getFullYear() !== yearNum ||
        date.getMonth() !== monthNum - 1 ||
        date.getDate() !== dayNum
    ) {
        return null;
    }

    return `${year}-${month}-${day}`;
}

/**
 * Formata hora para exibição em pt-BR (já está em formato 24h HH:mm)
 * Mantida para consistência, mas o formato já é o desejado
 * @param timeStr String no formato HH:mm
 * @returns String no formato HH:mm (24 horas)
 */
export function formatTimeToBR(timeStr: string): string {
    if (!timeStr) return '';
    // O formato HH:mm já é o formato brasileiro padrão
    return timeStr;
}

/**
 * Valida e parseia hora no formato HH:mm
 * @param brTimeStr String no formato HH:mm
 * @returns String validada no formato HH:mm ou null se inválido
 */
export function parseTimeFromBR(brTimeStr: string): string | null {
    if (!brTimeStr) return null;

    // Remove caracteres não numéricos, exceto dois pontos
    const cleaned = brTimeStr.replace(/[^\d:]/g, '');

    if (!cleaned.includes(':')) {
        if (cleaned.length < 4) return null;
        const withColon = `${cleaned.slice(0, 2)}:${cleaned.slice(2)}`;
        const pattern = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
        return pattern.test(withColon) ? withColon : null;
    }

    const parts = cleaned.split(':');
    if (parts.length !== 2) return null;

    const hours = parts[0].padStart(2, '0');
    const minutes = parts[1].padStart(2, '0');

    // Validação de valores
    const hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);

    if (hoursNum < 0 || hoursNum > 23) return null;
    if (minutesNum < 0 || minutesNum > 59) return null;

    const formatted = `${hours}:${minutes}`;
    const pattern = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
    return pattern.test(formatted) ? formatted : null;
}

/**
 * Formata uma data usando UTC para evitar conversão de timezone
 * Usado quando queremos exibir exatamente o que está salvo no banco
 * @param date Date ou string ISO
 * @returns String no formato dd/MM/yyyy HH:mm
 */
export function formatDateTimeUTC(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Obtém o dia da semana em português usando UTC
 * @param date Date ou string ISO
 * @returns Nome do dia da semana em português
 */
export function getWeekdayUTC(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const weekdays = [
        'Domingo',
        'Segunda-feira',
        'Terça-feira',
        'Quarta-feira',
        'Quinta-feira',
        'Sexta-feira',
        'Sábado'
    ];
    return weekdays[d.getUTCDay()];
}

/**
 * Formata uma data em formato longo pt-BR usando UTC
 * Ex: "Domingo, 01 de fevereiro de 2026 às 08:30"
 * @param date Date ou string ISO
 * @returns String formatada
 */
export function formatLongDateTimeUTC(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const weekday = getWeekdayUTC(d);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const month = months[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    return `${weekday}, ${day} de ${month} de ${year} às ${hours}:${minutes}`;
}

/**
 * Formata apenas a data em dd/MM/yyyy usando UTC
 * @param date Date ou string ISO
 * @returns String no formato dd/MM/yyyy
 */
export function formatDateOnlyUTC(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
}

