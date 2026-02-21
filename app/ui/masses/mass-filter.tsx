'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface MassFilterProps {
  weekdays: number[];
  times: string[];
  currentWeekday?: string;
  currentTime?: string;
  basePath?: string;
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
  basePath,
}: MassFilterProps) {
  const router = useRouter();

  // Props are the single source of truth for active filter state.
  // useSearchParams() was intentionally removed to prevent React error #300
  // (dual state update: Server Component re-render via props + client hook update in the same cycle).

  // Builds a clean URL containing only weekday, time, and page params.
  // Any other query params present in the current URL are intentionally not preserved —
  // callers should pass basePath with all required persistent params (e.g. ?tenant=slug).
  // Uses '&' as separator when basePath already contains a '?' to avoid double-? malformed URLs.
  const buildUrl = useCallback(
    (newWeekday?: string, newTime?: string) => {
      const params = new URLSearchParams();
      if (newWeekday !== undefined) params.set('weekday', newWeekday);
      if (newTime !== undefined) params.set('time', newTime);
      params.set('page', '1');
      const qs = params.toString();
      if (!basePath) return `?${qs}`;
      const separator = basePath.includes('?') ? '&' : '?';
      return `${basePath}${separator}${qs}`;
    },
    [basePath]
  );

  const handleWeekdayToggle = useCallback(
    (weekday: number) => {
      const isActive = currentWeekday === String(weekday);
      router.push(buildUrl(
        isActive ? undefined : String(weekday),
        currentTime
      ));
    },
    [router, buildUrl, currentWeekday, currentTime]
  );

  const handleTimeToggle = useCallback(
    (time: string) => {
      const isActive = currentTime === time;
      router.push(buildUrl(
        currentWeekday,
        isActive ? undefined : time
      ));
    },
    [router, buildUrl, currentWeekday, currentTime]
  );

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
