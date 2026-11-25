import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, ArrowLeft, Check, EyeOff, Loader2 } from 'lucide-react';
import { RUMOR_TARGETS } from '../data/eventData';
import {
  FIELD_LIMITS,
  hasErrors,
  validateRumorForm,
  type RumorFormValues,
  type ValidationErrors,
} from '../utils/orbitaLogic';
import { submitRumorToVault } from '../utils/submissionsStore';
import type { GuestProgress } from '../utils/guestProgress';

interface RumorMailboxViewProps {
  guestProgress: GuestProgress;
  onRumorSubmitted: (target: string) => void;
  onBackToInvitation: () => void;
  onGoToCreateCharacter: () => void;
}

export function RumorMailboxView({
  guestProgress,
  onRumorSubmitted,
  onBackToInvitation,
  onGoToCreateCharacter,
}: RumorMailboxViewProps) {
  const initialAuthor = guestProgress.guestName;
  const [values, setValues] = useState<RumorFormValues>({
    objetivo: '',
    autor: initialAuthor,
    anonymous: !initialAuthor.trim(),
    mania: '',
    soborno: '',
    chisme: '',
  });
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors<RumorFormValues>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSubmittedTarget, setLastSubmittedTarget] = useState<string | null>(null);

  useEffect(() => {
    if (initialAuthor.trim() && !values.autor.trim()) {
      setValues((prev) => ({
        ...prev,
        autor: initialAuthor,
        anonymous: false,
      }));
    }
  }, [initialAuthor, values.autor]);

  const updateField = <K extends keyof RumorFormValues>(
    field: K,
    nextValue: RumorFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: nextValue }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleToggleAnonymous = () => {
    setValues((prev) => ({
      ...prev,
      anonymous: !prev.anonymous,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = validateRumorForm(values);
    if (hasErrors(validation)) {
      setFieldErrors(validation);
      return;
    }

    const target = values.objetivo.trim();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitRumorToVault(values);
      setLastSubmittedTarget(target);
      onRumorSubmitted(target);
    } catch {
      setSubmitError(
        'No hemos podido archivar tu soplo en este momento. Comprueba tu conexión e inténtalo de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setLastSubmittedTarget(null);
    setFieldErrors({});
    setSubmitError(null);
    setValues((prev) => ({
      ...prev,
      objetivo: '',
      mania: '',
      soborno: '',
      chisme: '',
    }));
  };

  const inputBaseClass =
    'w-full min-h-[48px] rounded-2xl border bg-white/[0.035] px-4 py-3 text-sm sm:text-base text-[#f3f4f6] placeholder-[#6b7280] transition-colors duration-150 focus:outline-none focus:bg-white/[0.055] focus:ring-4';

  const inputStateClass = (hasError: boolean) =>
    hasError
      ? 'border-rose-500/70 focus:border-rose-400 focus:ring-rose-500/20'
      : 'border-white/[0.12] hover:border-white/[0.22] focus:border-[#8b5cf6] focus:ring-[#8b5cf6]/20';

  return (
    <section className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 left-1/2 h-64 w-[min(92vw,620px)] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#5b21b6]/30 via-[#7c3aed]/20 to-[#2563eb]/20 blur-[110px]"
      />

      <div className="relative z-10 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToInvitation}
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[#9ca3af] transition-colors hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] rounded-sm"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Volver a la invitación</span>
          </button>

          {guestProgress.rumorCount > 0 && (
            <p className="text-xs sm:text-sm text-[#c4b5fd] tabular-nums">
              {guestProgress.rumorCount === 1
                ? '1 soplo enviado desde este dispositivo'
                : `${guestProgress.rumorCount} soplos enviados desde este dispositivo`}
            </p>
          )}
        </div>

        <div className="mx-auto max-w-2xl text-center space-y-3.5">
          <p className="text-sm font-semibold text-[#c4b5fd]">
            Paso 2 de 2 · Después de crear tu personaje
          </p>
          <h1 className="font-display text-[clamp(2.1rem,5.5vw,3.75rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-[#f9fafb]">
            Buzón de <span className="text-gradient-orbital">Lady Nebula.</span>
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-[#9ca3af]">
            Cuéntanos trapos sucios, manías inconfesables o invéntate rumores escandalosos sobre{' '}
            <span className="text-[#f3f4f6]">el resto de invitados</span>. Todo se archiva de forma
            estrictamente confidencial para la organización.
          </p>
        </div>

        {/* 3-stage persistent progress banner */}
        {!guestProgress.step1Completed ? (
          <div
            role="region"
            aria-label="Aviso de Paso 1 pendiente"
            className="rounded-3xl border border-[#3b82f6]/40 bg-[#2563eb]/12 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#93c5fd]">
                ¿Todavía no has completado el Paso 1?
              </p>
              <p className="text-sm text-[#e5e7eb] leading-relaxed">
                Primero debes <strong className="text-white">crear tu personaje</strong> para que
                podamos preparar tu ficha. Si ya lo hiciste antes, puedes enviar tus rumores abajo.
              </p>
            </div>
            <button
              type="button"
              onClick={onGoToCreateCharacter}
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-[#2563eb] px-5 py-2.5 text-xs sm:text-sm font-medium text-white whitespace-nowrap transition-colors hover:bg-[#1d4ed8] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa]"
            >
              Ir al Paso 1: Crear personaje
            </button>
          </div>
        ) : guestProgress.rumorCount === 0 ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#34d399]/30 bg-[#34d399]/10 px-5 py-3.5 text-center text-xs sm:text-sm text-[#d1fae5]">
            <Check className="h-4 w-4 shrink-0 text-[#34d399]" aria-hidden="true" />
            <span>
              Paso 1 completado ({guestProgress.guestName}) · Ahora estás en el{' '}
              <strong className="text-white">Paso 2: Buzón de Lady Nebula</strong>.
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#34d399]/35 bg-[#34d399]/12 px-5 py-3.5 text-center text-xs sm:text-sm text-[#d1fae5] tabular-nums">
            <Check className="h-4 w-4 shrink-0 text-[#34d399]" aria-hidden="true" />
            <span>
              <strong className="text-white">¡Paso 1 y Paso 2 completados!</strong> (
              {guestProgress.guestName} · {guestProgress.rumorCount}{' '}
              {guestProgress.rumorCount === 1 ? 'soplo enviado' : 'soplos enviados'}) · Puedes
              añadir más rumores abajo.
            </span>
          </div>
        )}

        <div className="rounded-3xl border border-white/[0.08] bg-[#0e1017] p-6 sm:p-10 lg:p-12">
          {!lastSubmittedTarget ? (
            <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="rumor-objetivo"
                    className="mb-2 block text-xs sm:text-sm font-medium text-[#d1d5db]"
                  >
                    ¿Sobre qué invitado/a vas a escribir?{' '}
                    <span className="text-[#c4b5fd]">*</span>
                  </label>
                  <select
                    id="rumor-objetivo"
                    name="Invitado_Objetivo"
                    value={values.objetivo}
                    onChange={(e) => updateField('objetivo', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.objetivo)}
                    aria-describedby={fieldErrors.objetivo ? 'rumor-objetivo-error' : undefined}
                    className={`${inputBaseClass} ${inputStateClass(Boolean(fieldErrors.objetivo))}`}
                  >
                    <option value="" disabled>
                      Elige a tu víctima galáctica…
                    </option>
                    {RUMOR_TARGETS.map((target) => (
                      <option key={target} value={target}>
                        {target}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.objetivo && (
                    <p id="rumor-objetivo-error" className="mt-1.5 text-xs text-rose-300">
                      {fieldErrors.objetivo}
                    </p>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label
                      htmlFor="rumor-autor"
                      className="text-xs sm:text-sm font-medium text-[#d1d5db]"
                    >
                      Tu nombre (opcional)
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={values.anonymous}
                      onClick={handleToggleAnonymous}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] rounded-sm ${
                        values.anonymous ? 'text-[#c4b5fd]' : 'text-[#9ca3af] hover:text-white'
                      }`}
                    >
                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{values.anonymous ? 'Anónimo activado' : 'Modo anónimo'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    id="rumor-autor"
                    name="Informante_Secreto"
                    disabled={values.anonymous}
                    maxLength={FIELD_LIMITS.rumor.autorMax}
                    value={values.anonymous ? '' : values.autor}
                    onChange={(e) => updateField('autor', e.target.value)}
                    placeholder={
                      values.anonymous
                        ? 'Se guardará como Anónimo'
                        : 'Déjalo vacío para modo anónimo'
                    }
                    className={`${inputBaseClass} ${inputStateClass(Boolean(fieldErrors.autor))} disabled:opacity-55 disabled:cursor-not-allowed`}
                  />
                  {fieldErrors.autor && (
                    <p className="mt-1.5 text-xs text-rose-300">{fieldErrors.autor}</p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="rumor-mania"
                  className="mb-2 block text-xs sm:text-sm font-medium text-[#d1d5db]"
                >
                  1. Manía, frase típica o &quot;delito cotidiano&quot; que debemos exagerar{' '}
                  <span className="text-[#c4b5fd]">*</span>
                </label>
                <textarea
                  id="rumor-mania"
                  name="Mania_o_Anécdota"
                  rows={3}
                  maxLength={FIELD_LIMITS.rumor.maniaMax}
                  value={values.mania}
                  onChange={(e) => updateField('mania', e.target.value)}
                  placeholder="Ej. Siempre discute con los árbitros, se escaquea para irse a casa a las 22h, intenta entrenarte aunque solo le pidas la hora…"
                  aria-invalid={Boolean(fieldErrors.mania)}
                  aria-describedby={fieldErrors.mania ? 'rumor-mania-error' : undefined}
                  className={`${inputBaseClass} ${inputStateClass(Boolean(fieldErrors.mania))} resize-y min-h-[110px]`}
                />
                {fieldErrors.mania && (
                  <p id="rumor-mania-error" className="mt-1.5 text-xs text-rose-300">
                    {fieldErrors.mania}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="rumor-soborno"
                  className="mb-2 block text-xs sm:text-sm font-medium text-[#d1d5db]"
                >
                  2. ¿Con qué se le puede sobornar o sacar de quicio en 10 segundos?
                </label>
                <input
                  type="text"
                  id="rumor-soborno"
                  name="Talon_de_Aquiles_o_Soborno"
                  maxLength={FIELD_LIMITS.rumor.sobornoMax}
                  value={values.soborno}
                  onChange={(e) => updateField('soborno', e.target.value)}
                  placeholder="Ej. Con un buen dulce, criticando su película favorita, quitándole el sitio…"
                  className={`${inputBaseClass} ${inputStateClass(Boolean(fieldErrors.soborno))}`}
                />
                {fieldErrors.soborno && (
                  <p className="mt-1.5 text-xs text-rose-300">{fieldErrors.soborno}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="rumor-chisme"
                  className="mb-2 block text-xs sm:text-sm font-medium text-[#d1d5db]"
                >
                  3. Rumor loco (falso o sospechosamente real) para la crónica de la gala
                </label>
                <textarea
                  id="rumor-chisme"
                  name="Rumor_para_Lady_Nebula"
                  rows={2}
                  maxLength={FIELD_LIMITS.rumor.chismeMax}
                  value={values.chisme}
                  onChange={(e) => updateField('chisme', e.target.value)}
                  placeholder="Ej. 'Dicen que escondió un alijo ilegal en los motores de la nave' o alguna broma interna del grupo…"
                  className={`${inputBaseClass} ${inputStateClass(Boolean(fieldErrors.chisme))} resize-y min-h-[88px]`}
                />
                {fieldErrors.chisme && (
                  <p className="mt-1.5 text-xs text-rose-300">{fieldErrors.chisme}</p>
                )}
              </div>

              {submitError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-2xl border border-rose-500/35 bg-rose-950/40 p-4 text-xs sm:text-sm text-rose-200"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#2563eb] px-6 py-3.5 text-sm sm:text-base font-medium text-white transition-all duration-150 hover:opacity-95 hover:shadow-[0_12px_32px_rgba(124,58,237,0.34)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e1017]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      <span>Archivando soplo confidencial…</span>
                    </>
                  ) : (
                    <span>Enviar soplo confidencial</span>
                  )}
                </button>
                <p className="text-center text-xs text-[#6b7280]">
                  Puedes enviar tantos informes anónimos como quieras, uno por invitado. Nadie más
                  podrá leerlos.
                </p>
              </div>
            </form>
          ) : (
            <div className="mx-auto max-w-lg py-6 text-center space-y-6 animate-fade-up">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#6d28d9] to-[#3b82f6] shadow-[0_0_32px_rgba(124,58,237,0.4)]">
                <Check className="h-7 w-7 text-white" aria-hidden="true" />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium tracking-wide text-[#c4b5fd]">
                  Archivado en el buzón privado de Lady Nebula
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#f9fafb]">
                  Nota guardada sobre{' '}
                  <span className="text-gradient-cobalt">{lastSubmittedTarget}</span>.
                </h2>
                <p className="text-sm sm:text-base text-[#9ca3af] leading-relaxed">
                  Cuantos más invitados retrates, más impredecible y divertida será la gala. Solo la
                  organización tiene acceso a estos soplos.
                </p>
              </div>

              {guestProgress.rumorTargets.length > 0 && (
                <p className="text-xs text-[#9ca3af]">
                  Invitados retratados desde este dispositivo:{' '}
                  <span className="text-[#e5e7eb]">{guestProgress.rumorTargets.join(' · ')}</span>
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetForAnother}
                  className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center rounded-full bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#2563eb] px-7 py-3 text-sm font-medium text-white transition-opacity hover:opacity-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa]"
                >
                  Delatar a otro invitado
                </button>
                <button
                  type="button"
                  onClick={onBackToInvitation}
                  className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.05] px-7 py-3 text-sm font-medium text-[#f3f4f6] transition-colors hover:bg-white/[0.1] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
                >
                  Volver a la invitación
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
