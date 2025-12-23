import { NextRequest, NextResponse } from 'next/server';
import { getNextValidDates } from '@/lib/cron-utils';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { cronExpression, count = 10 } = body;

        if (!cronExpression || typeof cronExpression !== 'string') {
            return NextResponse.json(
                { error: 'Expressão CRON é obrigatória' },
                { status: 400 }
            );
        }

        const dates = getNextValidDates(cronExpression, count);
        
        return NextResponse.json({
            dates: dates.map(date => date.toISOString())
        });
    } catch (error) {
        console.error('Erro ao calcular datas CRON:', error);
        return NextResponse.json(
            { error: 'Erro ao calcular datas válidas' },
            { status: 500 }
        );
    }
}

