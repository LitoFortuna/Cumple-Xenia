import { ArrowRight, Check } from 'lucide-react';
import { getCompletedStepsCount, type GuestProgress } from '../utils/guestProgress';

interface MissionStepsBarProps {
  guestProgress: GuestProgress;
  onGoToStep1: () => void;
  onGoToStep2: () => void;
}

export function MissionStepsBar({
  guestProgress,
  onGoToStep1,
  onGoToStep2,
}: MissionStepsBarProps) {
  const step1Done = guestProgress.step1Completed;
  const step2Done = guestProgress.rumorCount > 0;
  const completedCount = getCompletedStepsCount(guestProgress);

  return (
    <div
      aria-label="Orden de participación en dos pasos"
      className="mx-auto mt-8 max-w-3xl text-left"
    >
      <p className="mb-3 text-center text-xs font-medium tracking-wide text-[#9ca3af] tabular-nums">
        <span>Cómo participar</span>
        <span aria-hidden="true" className="mx-2 text-[#4b5563]">·</span>
        <span className={completedCount === 2 ? 'text-[#34d399]' : 'text-[#d1d5db]'}>
          {completedCount === 2
            ? '2 de 2 pasos completados'
            : completedCount === 1
              ? '1 de 2 pasos completado'
              : 'Sigue este orden (0 de 2)'}
        </span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-3">
        {/* Paso 1 */}
        <button
          type="button"
          onClick={onGoToStep1}
          className={`group flex flex-col justify-between rounded-2xl border p-4 sm:p-5 text-left transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa] ${
            step1Done
              ? 'border-[#34d399]/35 bg-[#0e1017]/90 hover:border-[#34d399]/55'
              : 'border-[#3b82f6]/55 bg-[#2563eb]/12 hover:bg-[#2563eb]/18'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-xs font-semibold ${
                step1Done ? 'text-[#34d399]' : 'text-[#93c5fd]'
              }`}
            >
              {step1Done ? 'Paso 1 · Completado' : 'Paso 1 · Empieza aquí'}
            </span>
            <span
              aria-hidden="true"
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                step1Done
                  ? 'bg-[#34d399]/20 text-[#34d399]'
                  : 'bg-[#2563eb] text-white'
              }`}
            >
              {step1Done ? <Check className="h-3.5 w-3.5" /> : '1'}
            </span>
          </div>

          <p className="mt-2 font-display text-base sm:text-lg font-semibold text-[#f9fafb]">
            Crea tu personaje
          </p>
          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#9ca3af]">
            {step1Done
              ? `Ficha registrada para ${guestProgress.guestName}.`
              : 'Registra primero tus datos y elige tu arquetipo para diseñar tu rol.'}
          </p>
        </button>

        {/* Connector */}
        <div
          aria-hidden="true"
          className="hidden md:flex items-center justify-center text-[#6b7280]"
        >
          <ArrowRight className="h-5 w-5" />
        </div>

        {/* Paso 2 */}
        <button
          type="button"
          onClick={onGoToStep2}
          className={`group flex flex-col justify-between rounded-2xl border p-4 sm:p-5 text-left transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa] ${
            step2Done
              ? 'border-[#34d399]/35 bg-[#0e1017]/90 hover:border-[#34d399]/55'
              : step1Done
                ? 'border-[#8b5cf6]/60 bg-[#6d28d9]/18 hover:bg-[#6d28d9]/26'
                : 'border-white/[0.1] bg-[#0e1017]/80 hover:border-white/[0.2] hover:bg-[#131622]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-xs font-semibold ${
                step2Done
                  ? 'text-[#34d399]'
                  : step1Done
                    ? 'text-[#c4b5fd]'
                    : 'text-[#9ca3af]'
              }`}
            >
              {step2Done
                ? `Paso 2 · Completado (${guestProgress.rumorCount})`
                : step1Done
                  ? 'Paso 2 · ¡Tu siguiente paso!'
                  : 'Paso 2 · Después de registrarte'}
            </span>
            <span
              aria-hidden="true"
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                step2Done
                  ? 'bg-[#34d399]/20 text-[#34d399]'
                  : step1Done
                    ? 'bg-[#7c3aed] text-white'
                    : 'border border-white/20 text-[#9ca3af]'
              }`}
            >
              {step2Done ? <Check className="h-3.5 w-3.5" /> : '2'}
            </span>
          </div>

          <p className="mt-2 font-display text-base sm:text-lg font-semibold text-[#f9fafb]">
            Entra al Buzón de Lady Nebula
          </p>
          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#9ca3af]">
            {step2Done
              ? `${guestProgress.rumorCount} ${guestProgress.rumorCount === 1 ? 'soplo enviado' : 'soplos enviados'}. Pulsa si quieres añadir más rumores.`
              : 'Filtra manías, sobornos o rumores anónimos sobre el resto de invitados.'}
          </p>
        </button>
      </div>
    </div>
  );
}
