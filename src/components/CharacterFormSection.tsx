import { useState, type FormEvent } from 'react';
import { AlertCircle, ArrowRight, Check, Loader2 } from 'lucide-react';
import { ARCHETYPES, GUESTS } from '../data/eventData';
import {
  FIELD_LIMITS,
  hasErrors,
  validateCharacterForm,
  type CharacterFormValues,
  type ValidationErrors,
} from '../utils/orbitaLogic';
import { submitCharacterToVault } from '../utils/submissionsStore';
import type { GuestProgress } from '../utils/guestProgress';

interface CharacterFormSectionProps {
  guestProgress: GuestProgress;
  onRegistered: (guestName: string, archetype: string) => void;
  onOpenRumors: (prefillAuthor?: string) => void;
}

const INITIAL_VALUES: CharacterFormValues = {
  nombre: '',
  email: '',
  perfil: '',
  mania: '',
  lema: '',
};

export function CharacterFormSection({
  guestProgress,
  onRegistered,
  onOpenRumors,
}: CharacterFormSectionProps) {
  const [values, setValues] = useState<CharacterFormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors<CharacterFormValues>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedGuest, setSubmittedGuest] = useState<{
    nombre: string;
    perfil: string;
  } | null>(null);

  const updateField = <K extends keyof CharacterFormValues>(
    field: K,
    nextValue: CharacterFormValues[K]
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = validateCharacterForm(values);
    if (hasErrors(validation)) {
      setFieldErrors(validation);
      return;
    }

    const guestName = values.nombre.trim();
    const guestArchetype = values.perfil.trim();

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitCharacterToVault(values);
      setSubmittedGuest({
        nombre: guestName,
        perfil: guestArchetype,
      });
      onRegistered(guestName, guestArchetype);
    } catch {
      setSubmitError(
        'No hemos podido guardar tu ficha en este momento. Comprueba tu conexión e inténtalo de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterAnother = () => {
    setSubmittedGuest(null);
    setValues(INITIAL_VALUES);
    setFieldErrors({});
    setSubmitError(null);
  };

  const inputBaseClass =
    'w-full min-h-[48px] rounded-2xl border bg-white/[0.035] px-4 py-3 text-sm sm:text-base text-[#f3f4f6] placeholder-[#6b7280] transition-colors duration-150 focus:outline-none focus:bg-white/[0.055] focus:ring-4';

  const inputStateClass = (hasError: boolean) =>
    hasError
      ? 'border-rose-500/70 focus:border-rose-400 focus:ring-rose-500/20'
      : 'border-white/[0.12] hover:border-white/[0.22] focus:border-[#3b82f6] focus:ring-[#3b82f6]/20';

  return (
    <section
      id="personaje"
      className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 scroll-mt-20"
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0e1017] p-6 sm:p-10 lg:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-52 w-[min(90vw,540px)] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#5b21b6]/24 via-[#2563eb]/20 to-[#7c3aed]/20 blur-[90px]"
        />

        <div className="relative z-10">
          {!submittedGuest ? (
            <>
              <div className="mx-auto mb-8 max-w-xl text-center space-y-2.5">
                <p className="text-sm font-semibold text-[#60a5fa]">
                  Paso 1 de 2 · Empieza aquí antes de entrar al Buzón
                </p>
                <h2 className="font-display text-[clamp(1.85rem,4vw,2.75rem)] font-semibold tracking-[-0.03em] text-[#f9fafb]">
                  Crea tu personaje.
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-[#9ca3af]">
                  Completa primero este formulario confidencial para diseñar tu rol a medida. Al
                  enviarlo pasarás directamente al{' '}
                  <span className="text-[#f3f4f6]">Paso 2: Buzón de Lady Nebula</span>.
                </p>
              </div>

              {guestProgress.step1Completed && (
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-y border-white/[0.08] py-4">
                  <div className="flex items-start gap-2.5">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#34d399]"
                      aria-hidden="true"
                    />
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs sm:text-sm font-medium text-[#d1fae5]">
                        Paso 1 ya completado en este dispositivo como{' '}
                        <span className="font-semibold text-white">
                          {guestProgress.guestName}
                        </span>
                      </p>
                      <p className="text-xs text-[#9ca3af]">
                        {guestProgress.rumorCount > 0
                          ? `También llevas ${guestProgress.rumorCount} ${guestProgress.rumorCount === 1 ? 'soplo enviado' : 'soplos enviados'} en el Buzón. Si entra otra persona desde aquí, puede registrar su ficha abajo.`
                          : 'Ya puedes pasar directamente al Paso 2, o registrar aquí la ficha de otra persona.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenRumors(guestProgress.guestName)}
                    className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#6d28d9] to-[#2563eb] px-4 py-2 text-xs sm:text-sm font-medium text-white whitespace-nowrap transition-opacity hover:opacity-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa]"
                  >
                    <span>
                      {guestProgress.rumorCount > 0 ? 'Enviar más rumores' : 'Ir al Paso 2: Buzón'}
                    </span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}

              <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="rsvp-nombre"
                      className="mb-2 block text-xs sm:text-sm font-medium text-[#d1d5db]"
                    >
                      ¿Quién eres? <span className="text-[#60a5fa]">*</span>
                    </label>
                    <select
                      id="rsvp-nombre"
                      name="Nombre"
                      value={values.nombre}
                      onChange={(e) => updateField('nombre', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.nombre)}
                      aria-describedby={fieldErrors.nombre ? 'rsvp-nombre-error' : undefined}
                      className={`${inputBaseClass} ${inputStateClass(Boolean(fieldErrors.nombre))}`}
                    >
                      <option value="" disabled>
                        Selecciona tu nombre…
                      </option>
                      {GUESTS.map((guest) => (
                        <option key={guest} value={guest}>
                          {guest}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.nombre && (
                      <p id="rsvp-nombre-error" className="mt-1.5 text-xs text-rose-300">
                        {fieldErrors.nombre}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="rsvp-email"
                      className="mb-2 block text-xs sm:text-sm font-medium text-[#d1d5db]"
                    >
                      Tu correo electrónico <span className="text-[#60a5fa]">*</span>
                    </label>
                    <input
                      type="email"
                      id="rsvp-email"
                      name="Email"
                      autoComplete="email"
                      maxLength={FIELD_LIMITS.character.emailMax}
                      value={values.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="para enviarte tu ficha privada"
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'rsvp-email-error' : undefined}
                      className={`${inputBaseClass} ${inputStateClass(Boolean(fieldErrors.email))}`}
                    />
                    {fieldErrors.email && (
                      <p id="rsvp-email-error" className="mt-1.5 text-xs text-rose-300">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Accessible Interactive Archetype Selector */}
                <fieldset>
                  <legend className="mb-3 block text-xs sm:text-sm font-medium text-[#d1d5db]">
                    1. ¿Qué vibra te apetece interpretar en el crucero?{' '}
                    <span className="text-[#60a5fa]">*</span>
                  </legend>
                  <div
                    role="radiogroup"
                    aria-label="Perfil de juego"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    {ARCHETYPES.map((option) => {
                      const isSelected = values.perfil === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => updateField('perfil', option.value)}
                          className={`group flex flex-col items-start justify-between rounded-2xl border p-4 text-left transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] ${
                            isSelected
                              ? 'border-[#3b82f6] bg-[#2563eb]/14'
                              : 'border-white/[0.1] bg-white/[0.025] hover:border-white/[0.2] hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex w-full items-center justify-between gap-2">
                            <span className="font-display text-base font-semibold text-[#f9fafb]">
                              {option.title}
                            </span>
                            <span
                              aria-hidden="true"
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                isSelected
                                  ? 'border-[#60a5fa] bg-[#2563eb] text-white'
                                  : 'border-white/25 bg-transparent'
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs font-medium text-[#93c5fd]">
                            {option.subtitle}
                          </p>
                          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#9ca3af]">
                            {option.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {fieldErrors.perfil && (
                    <p className="mt-2 text-xs text-rose-300">{fieldErrors.perfil}</p>
                  )}
                </fieldset>

                <div>
                  <label
                    htmlFor="rsvp-mania"
                    className="mb-2 block text-xs sm:text-sm font-medium text-[#d1d5db]"
                  >
                    2. Confiesa una manía, vicio o &quot;delito cotidiano&quot; tuyo{' '}
                    <span className="text-[#60a5fa]">*</span>
                  </label>
                  <input
                    type="text"
                    id="rsvp-mania"
                    name="Mania_Propia"
                    maxLength={FIELD_LIMITS.character.maniaMax}
                    value={values.mania}
                    onChange={(e) => updateField('mania', e.target.value)}
                    placeholder="Ej. Llego tarde a todo, no sé perder, miro obras en la calle…"
                    aria-invalid={Boolean(fieldErrors.mania)}
                    aria-describedby={fieldErrors.mania ? 'rsvp-mania-error' : undefined}
                    className={`${inputBaseClass} ${inputStateClass(Boolean(fieldErrors.mania))}`}
                  />
                  {fieldErrors.mania && (
                    <p id="rsvp-mania-error" className="mt-1.5 text-xs text-rose-300">
                      {fieldErrors.mania}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="rsvp-lema"
                    className="mb-2 block text-xs sm:text-sm font-medium text-[#d1d5db]"
                  >
                    3. Una canción o frase que sería el himno de tu personaje{' '}
                    <span className="text-[#60a5fa]">*</span>
                  </label>
                  <input
                    type="text"
                    id="rsvp-lema"
                    name="Himno_o_Frase"
                    maxLength={FIELD_LIMITS.character.lemaMax}
                    value={values.lema}
                    onChange={(e) => updateField('lema', e.target.value)}
                    placeholder="Ej. 'Yo no fui, estaba bailando' o el título de un temazo"
                    aria-invalid={Boolean(fieldErrors.lema)}
                    aria-describedby={fieldErrors.lema ? 'rsvp-lema-error' : undefined}
                    className={`${inputBaseClass} ${inputStateClass(Boolean(fieldErrors.lema))}`}
                  />
                  {fieldErrors.lema && (
                    <p id="rsvp-lema-error" className="mt-1.5 text-xs text-rose-300">
                      {fieldErrors.lema}
                    </p>
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

                <div className="pt-2 space-y-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#2563eb] px-6 py-3.5 text-sm sm:text-base font-medium text-white transition-all duration-150 hover:bg-[#1d4ed8] hover:shadow-[0_12px_32px_rgba(37,99,235,0.34)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e1017]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        <span>Guardando tu personaje…</span>
                      </>
                    ) : (
                      <span>Enviar mi personaje</span>
                    )}
                  </button>
                  <p className="text-center text-xs text-[#6b7280]">
                    Tus respuestas son estrictamente confidenciales: solo las recibe la organización.
                  </p>
                </div>
              </form>
            </>
          ) : (
            <div className="mx-auto max-w-lg py-4 text-center space-y-6 animate-fade-up">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#6d28d9] to-[#2563eb] shadow-[0_0_32px_rgba(37,99,235,0.38)]">
                <Check className="h-7 w-7 text-white" aria-hidden="true" />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium tracking-wide text-[#60a5fa]">
                  Paso 1 completado · {submittedGuest.perfil}
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#f9fafb]">
                  Recibido, <span className="text-gradient-cobalt">{submittedGuest.nombre}</span>.
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-[#9ca3af]">
                  Tu ficha se ha guardado de forma totalmente confidencial para la organización.
                  Nadie más podrá ver tus respuestas.
                </p>
              </div>

              <div className="border-t border-white/[0.08] pt-6 space-y-4">
                <p className="text-xs font-semibold text-[#c4b5fd]">
                  Paso 2 de 2 · Ahora te toca
                </p>
                <p className="text-sm text-[#d1d5db] leading-relaxed">
                  ¡Paso 1 completado! Ahora entra al{' '}
                  <strong className="text-white">Buzón de Lady Nebula</strong> y envía rumores
                  confidenciales sobre el resto de invitados.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenRumors(submittedGuest.nombre)}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#2563eb] px-6 py-3.5 text-sm sm:text-base font-medium text-white transition-opacity duration-150 hover:opacity-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa]"
                >
                  <span>Continuar al Paso 2: Buzón de Lady Nebula</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={handleRegisterAnother}
                  className="text-xs sm:text-sm font-medium text-[#9ca3af] transition-colors hover:text-white cursor-pointer"
                >
                  Registrar otro personaje
                </button>
              </div>

              <p className="text-xs text-[#6b7280]">
                Recuerda mantener silencio absoluto con Xenia sobre los detalles.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
