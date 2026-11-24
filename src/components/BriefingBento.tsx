import { useState } from 'react';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { EVENT_CONFIG } from '../data/eventData';

interface BriefingBentoProps {
  onOpenRumors: () => void;
}

export function BriefingBento({ onOpenRumors }: BriefingBentoProps) {
  const [copiedCoords, setCopiedCoords] = useState(false);

  const handleCopyCoordinates = async () => {
    try {
      await navigator.clipboard.writeText(`${EVENT_CONFIG.venueAddress} (${EVENT_CONFIG.coordinates})`);
      setCopiedCoords(true);
      window.setTimeout(() => setCopiedCoords(false), 2400);
    } catch {
      setCopiedCoords(true);
      window.setTimeout(() => setCopiedCoords(false), 2400);
    }
  };

  return (
    <section
      id="detalles"
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20 scroll-mt-20"
    >
      <div className="mb-8 sm:mb-10 max-w-2xl space-y-2">
        <p className="text-sm font-medium text-[#60a5fa]">02. Briefing de embarque</p>
        <h2 className="font-display text-[clamp(1.85rem,4vw,3.1rem)] font-semibold tracking-[-0.03em] text-[#f9fafb]">
          Todo lo que necesitas saber.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Card 1: Fecha y Hora */}
        <article className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0e1017] p-6 sm:p-8 lg:p-10 sm:col-span-2 lg:col-span-7 flex flex-col justify-between min-h-[240px] transition-colors duration-200 hover:border-white/[0.15]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#2563eb]/20 blur-[70px]"
          />
          <p className="relative z-10 text-xs font-medium tracking-wide text-[#60a5fa]">
            Fecha y hora confirmadas
          </p>
          <div className="relative z-10 mt-6 space-y-1.5">
            <p className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.035em] text-[#f9fafb]">
              {EVENT_CONFIG.dateLabel}
            </p>
            <p className="text-lg sm:text-2xl font-medium text-[#9ca3af]">
              {EVENT_CONFIG.weekdayYearLabel}{' '}
              <span aria-hidden="true" className="mx-1 text-[#4b5563]">·</span>{' '}
              <span className="text-[#f9fafb] tabular-nums">{EVENT_CONFIG.timeLabel}</span>
            </p>
          </div>
          <p className="relative z-10 mt-6 text-sm text-[#9ca3af]">
            {EVENT_CONFIG.durationLabel}
          </p>
        </article>

        {/* Card 2: Silencio Total */}
        <article className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0e1017] p-6 sm:p-8 lg:p-10 lg:col-span-5 flex flex-col justify-between min-h-[240px] transition-colors duration-200 hover:border-white/[0.15]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -right-14 h-52 w-52 rounded-full bg-[#6d28d9]/25 blur-[70px]"
          />
          <p className="relative z-10 text-xs font-medium tracking-wide text-[#c4b5fd]">
            Protocolo confidencial
          </p>
          <div className="relative z-10 mt-6 space-y-2.5">
            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.025em] text-[#f9fafb]">
              Silencio total.
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-[#9ca3af]">
              Xenia no conoce el guion, las pruebas ni los roles asignados. Mantén tu ficha bajo
              llave hasta la noche de la gala.
            </p>
          </div>
        </article>

        {/* Card 3: Coordenadas */}
        <article className="rounded-3xl border border-white/[0.08] bg-[#0e1017] p-6 sm:p-8 lg:p-10 lg:col-span-5 flex flex-col justify-between min-h-[220px] transition-colors duration-200 hover:border-white/[0.15]">
          <p className="text-xs font-medium tracking-wide text-[#9ca3af]">Coordenadas</p>
          <div className="mt-5 space-y-1.5">
            <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-[#f9fafb]">
              {EVENT_CONFIG.venueName}
            </h3>
            <p className="text-sm sm:text-base text-[#9ca3af]">{EVENT_CONFIG.venueAddress}</p>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
            <span className="font-mono text-xs tabular-nums text-[#9ca3af]">
              {EVENT_CONFIG.coordinates}
            </span>
            <button
              type="button"
              onClick={handleCopyCoordinates}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#93c5fd] transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
            >
              {copiedCoords ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#34d399]" aria-hidden="true" />
                  <span className="text-[#34d399]">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copiar ubicación</span>
                </>
              )}
            </button>
          </div>
        </article>

        {/* Card 4: Pre-juego Lady Nebula */}
        <article className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0e1017] p-6 sm:p-8 lg:p-10 sm:col-span-2 lg:col-span-7 flex flex-col justify-between min-h-[220px] transition-colors duration-200 hover:border-white/[0.15]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#5b21b6]/15 via-transparent to-[#2563eb]/15"
          />
          <p className="relative z-10 text-xs font-medium tracking-wide text-[#c4b5fd]">
            Pre-juego activo
          </p>
          <div className="relative z-10 mt-5 space-y-3">
            <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-[#f9fafb]">
              El juego empieza antes de embarcar.
            </h3>
            <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[#9ca3af]">
              Filtra manías, sobornos o rumores anónimos sobre el resto de invitados en el Buzón de
              Lady Nebula para incendiar la gala.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenRumors}
                className="group inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-[#93c5fd] transition-colors hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] rounded-sm"
              >
                <span>Ir al Buzón confidencial</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
