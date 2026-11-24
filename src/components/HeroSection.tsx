import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { EVENT_CONFIG } from '../data/eventData';
import { computeCountdown, padTwo } from '../utils/orbitaLogic';

interface HeroSectionProps {
  onStartCharacter: () => void;
  onOpenRumors: () => void;
}

export function HeroSection({ onStartCharacter, onOpenRumors }: HeroSectionProps) {
  const [countdown, setCountdown] = useState(() =>
    computeCountdown(EVENT_CONFIG.eventDateISO)
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(computeCountdown(EVENT_CONFIG.eventDateISO));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id="top" className="relative overflow-hidden pt-14 sm:pt-20 lg:pt-24">
      {/* Controlled ambient atmospheric glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-1/2 h-[340px] w-[min(92vw,760px)] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#5b21b6]/25 via-[#2563eb]/20 to-[#7c3aed]/20 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6 animate-fade-up">
          {/* Clean unboxed metadata kicker */}
          <p className="text-xs sm:text-sm font-medium tracking-wide text-[#60a5fa]">
            <span>Año 3027</span>
            <span aria-hidden="true" className="mx-2 text-[#4b5563]">·</span>
            <span>Crucero Aristocrático Nebulosa Real</span>
            <span aria-hidden="true" className="mx-2 text-[#4b5563] hidden sm:inline">·</span>
            <span className="hidden sm:inline text-[#9ca3af]">Alto secreto frente a la Comisaria Xenia</span>
          </p>

          <h1 className="mx-auto max-w-4xl font-display text-[clamp(2.65rem,7vw,5.25rem)] font-semibold leading-[1.03] tracking-[-0.035em] text-[#f9fafb]">
            El Escándalo de{' '}
            <span className="text-gradient-orbital block sm:inline">Órbita-X.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-xl lg:text-2xl font-normal leading-relaxed text-[#9ca3af]">
            Gala Estelar del Ritmo y cumpleaños de Xenia.{' '}
            <span className="text-[#f3f4f6] font-medium">
              Domingo 3 de enero a las 17:00h.
            </span>
          </p>

          {/* Primary + secondary action pair */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 pt-2">
            <button
              type="button"
              onClick={onStartCharacter}
              className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center rounded-full bg-[#2563eb] px-8 py-3.5 text-sm sm:text-base font-medium text-white whitespace-nowrap transition-all duration-150 hover:bg-[#1d4ed8] hover:shadow-[0_12px_32px_rgba(37,99,235,0.34)] active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06070b]"
            >
              Crear mi personaje
            </button>

            <button
              type="button"
              onClick={onOpenRumors}
              className="group inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-full px-5 py-3 text-sm sm:text-base font-medium text-[#93c5fd] whitespace-nowrap transition-colors duration-150 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa]"
            >
              <span>Entrar al Buzón Lady Nebula</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Live tabular countdown strip */}
          <div
            aria-label="Cuenta atrás para la gala"
            className="mx-auto mt-8 inline-grid grid-cols-4 gap-3 sm:gap-7 border-t border-white/[0.08] pt-6 text-center"
          >
            <div>
              <p className="font-mono text-2xl sm:text-3xl font-medium tabular-nums text-white">
                {padTwo(countdown.days)}
              </p>
              <p className="mt-1 text-xs text-[#9ca3af]">Días</p>
            </div>
            <div>
              <p className="font-mono text-2xl sm:text-3xl font-medium tabular-nums text-white">
                {padTwo(countdown.hours)}
              </p>
              <p className="mt-1 text-xs text-[#9ca3af]">Horas</p>
            </div>
            <div>
              <p className="font-mono text-2xl sm:text-3xl font-medium tabular-nums text-white">
                {padTwo(countdown.minutes)}
              </p>
              <p className="mt-1 text-xs text-[#9ca3af]">Min</p>
            </div>
            <div>
              <p className="font-mono text-2xl sm:text-3xl font-medium tabular-nums text-[#60a5fa]">
                {padTwo(countdown.seconds)}
              </p>
              <p className="mt-1 text-xs text-[#9ca3af]">Seg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Luminous Planetary Horizon Visual */}
      <div className="relative mt-10 sm:mt-14 lg:mt-16 h-44 sm:h-64 md:h-80 w-full overflow-hidden">
        <div className="orbital-horizon absolute inset-x-[-22%] -bottom-[58%] h-[168%] rounded-[50%]" />

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
          viewBox="0 0 1440 420"
          fill="none"
          preserveAspectRatio="xMidYMax slice"
        >
          <path d="M-40 390 Q 720 40 1480 390" stroke="url(#orbitaArcPrimary)" strokeWidth="1.25" />
          <path
            d="M120 420 Q 720 120 1320 420"
            stroke="url(#orbitaArcSecondary)"
            strokeWidth="1"
            strokeDasharray="3 6"
          />
          <circle cx="720" cy="214" r="4" fill="#ffffff" />
          <circle cx="720" cy="214" r="14" stroke="#60a5fa" strokeOpacity="0.45" />
          <circle cx="480" cy="242" r="2" fill="#a78bfa" />
          <circle cx="965" cy="244" r="2.2" fill="#60a5fa" />
          <defs>
            <linearGradient id="orbitaArcPrimary" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#5b21b6" stopOpacity="0" />
              <stop offset="30%" stopColor="#a78bfa" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="orbitaArcSecondary" x1="120" y1="0" x2="1320" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-x-0 bottom-0 h-24 sm:h-28 bg-gradient-to-t from-[#06070b] via-[#06070b]/80 to-transparent" />
      </div>
    </section>
  );
}
