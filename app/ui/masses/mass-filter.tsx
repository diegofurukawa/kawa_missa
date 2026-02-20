'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface MassFilterProps {
  weekdays: number[];
  times: string[];
  currentWeekday?: string;
  currentTime?: string;
}

const WEEKDAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export function MassFilter({
  weekdays,
  times,
  currentWeekday,
  currentTime,
}: MassFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleWeekdayToggle = useCallback(
    (weekday: number) => {
      const params = new URLSearchParams(searchParams);
      if (params.get('weekday') === String(weekday)) {
        params.delete('weekday');
      } else {
        params.set('weekday', String(weekday));
      }
      params.set('page', '1');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleTimeToggle = useCallback(
    (time: string) => {
      const params = new URLSearchParams(searchParams);
      if (params.get('time') === time) {
        params.delete('time');
      } else {
        params.set('time', time);
      }
      params.set('page', '1');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  if (weekdays.length === 0 && times.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-4">
      {weekdays.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Dia da Semana</h3>
          <div className="flex flex-wrap gap-2">
            {weekdays.map((weekday) => (
              <button
                key={weekday}
                onClick={() => handleWeekdayToggle(weekday)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  currentWeekday === String(weekday)
                    ? 'bg-[#6d7749] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {WEEKDAY_NAMES[weekday]}
              </button>
            ))}
          </div>
        </div>
      )}

      {times.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Horário</h3>
          <div className="flex flex-wrap gap-2">
            {times.map((time) => (
              <button
                key={time}
                onClick={() => handleTimeToggle(time)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  currentTime === time
                    ? 'bg-[#6d7749] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
