import { useState } from 'react';
import { ArrowRight, CalendarPlus, Check, RotateCcw } from 'lucide-react';
import { EVENT_CONFIG } from '../data/eventData';
import { downloadGalaCalendarFile } from '../utils/calendarIcs';
import { getProgressStage, type GuestProgress } from '../utils/guestProgress';

interface BoardingPassCardProps {
  progress: GuestProgress;
  onOpenRumors: () => void;
  onResetProgress: () => void;
}

export function BoardingPassCard({
  progress,
  onOpenRumors,
  onResetProgress,
}: BoardingPassCardProps) {
  const [calendarSaved, setCalendarSaved] = useState(false);

  if (!progress.step1Completed) return null;

  const stage = getProgressStage(progress);
  const allDone = stage === 'all-done';

  const handleDownloadCalendar = () => {
    downloadGalaCalendarFile();
    setCalendarSaved(true);
    window.setTimeout(() => setCalendarSaved(false), 2600);
  };

  return (
    <aside
      aria-label="Tarjeta de embarque personal"
      className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0e1017]/95 text-left animate-fade-up"
    >
      <div className="p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide text-[#93c5fd]">
              Pase de embarque · {EVENT_CONFIG.venueName}
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#f9fafb]">
              {progress.guestName}
              {progress.archetype && (
                <span className="ml-2 text-sm sm:text-base font-normal text-[#9ca3af]">
                  · {progress.archetype}
                </span>
              )}
            </h2>
          </div>

          <div className="text-xs font-medium text-[#d1d5db] sm:text-right">
            <p className="tabular-nums text-[#f3f4f6]">
              {EVENT_CONFIG.dateLabel} · {EVENT_CONFIG.timeLabel}
            </p>
            <p className="text-[#9ca3af]">{EVENT_CONFIG.venueAddress}</p>
          </div>
        </div>

        {/* Explicit Step 1 & Step 2 completion checklist (text + icon, never color-only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#34d399]/20 text-[#34d399]"
            >
              <Check className="h-3 w-3" />
            </span>
            <div>
              <p className="font-medium text-[#f3f4f6]">Paso 1 completado</p>
              <p className="text-xs text-[#9ca3af]">Personaje registrado para la organización.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span
              aria-hidden="true"
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                allDone
                  ? 'bg-[#34d399]/20 text-[#34d399]'
                  : 'bg-[#7c3aed]/25 text-[#c4b5fd]'
              }`}
            >
              {allDone ? <Check className="h-3 w-3" /> : '2'}
            </span>
            <div>
              <p className="font-medium text-[#f3f4f6]">
                {allDone
                  ? `Paso 2 completado (${progress.rumorCount} ${progress.rumorCount === 1 ? 'soplo' : 'soplos'})`
                  : 'Paso 2 pendiente'}
              </p>
              <p className="text-xs text-[#9ca3af]">
                {allDone
                  ? 'Ya has nutrido el Buzón de Lady Nebula. Puedes añadir más cuando quieras.'
                  : 'Entra ahora al Buzón de Lady Nebula para enviar rumores confidenciales.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-white/[0.08] pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenRumors}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#6d28d9] to-[#2563eb] px-5 py-2 text-xs sm:text-sm font-medium text-white whitespace-nowrap transition-opacity hover:opacity-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa]"
            >
              <span>{allDone ? 'Enviar otro rumor' : 'Completar Paso 2: Buzón'}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handleDownloadCalendar}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-xs sm:text-sm font-medium text-[#e5e7eb] whitespace-nowrap transition-colors hover:bg-white/[0.08] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
            >
              {calendarSaved ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#34d399]" aria-hidden="true" />
                  <span className="text-[#34d399]">Evento descargado</span>
                </>
              ) : (
                <>
                  <CalendarPlus className="h-3.5 w-3.5 text-[#93c5fd]" aria-hidden="true" />
                  <span>Añadir al calendario</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onResetProgress}
            className="inline-flex min-h-[44px] self-start sm:self-center items-center gap-1.5 text-xs font-medium text-[#9ca3af] transition-colors hover:text-white cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Cambiar invitado en este dispositivo</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
