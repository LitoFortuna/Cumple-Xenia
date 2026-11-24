export interface CountdownSnapshot {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export interface CharacterFormValues {
  nombre: string;
  email: string;
  perfil: string;
  mania: string;
  lema: string;
}

export interface RumorFormValues {
  objetivo: string;
  autor: string;
  anonymous: boolean;
  mania: string;
  soborno: string;
  chisme: string;
}

export type ValidationErrors<T extends object> = Partial<Record<keyof T, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function computeCountdown(targetISO: string, nowMs: number = Date.now()): CountdownSnapshot {
  const targetMs = new Date(targetISO).getTime();
  const diffMs = targetMs - nowMs;

  if (!Number.isFinite(targetMs) || diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
  };
}

export function padTwo(value: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(2, '0');
}

export function validateCharacterForm(values: CharacterFormValues): ValidationErrors<CharacterFormValues> {
  const errors: ValidationErrors<CharacterFormValues> = {};

  if (!values.nombre.trim()) {
    errors.nombre = 'Selecciona tu nombre en la lista de pasajeros.';
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = 'Necesitamos tu correo para enviarte tu ficha secreta.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Introduce un correo electrónico válido.';
  }

  if (!values.perfil.trim()) {
    errors.perfil = 'Elige el estilo de personaje que quieres interpretar.';
  }

  if (values.mania.trim().length < 3) {
    errors.mania = 'Confiesa al menos una manía o vicio breve.';
  }

  if (values.lema.trim().length < 2) {
    errors.lema = 'Añade una canción o frase himno para tu personaje.';
  }

  return errors;
}

export function validateRumorForm(values: RumorFormValues): ValidationErrors<RumorFormValues> {
  const errors: ValidationErrors<RumorFormValues> = {};

  if (!values.objetivo.trim()) {
    errors.objetivo = 'Selecciona sobre qué invitado vas a escribir.';
  }

  if (values.mania.trim().length < 5) {
    errors.mania = 'Cuéntanos una manía o anécdota con un poco más de detalle.';
  }

  return errors;
}

export function buildCharacterPayload(values: CharacterFormValues): Record<string, string> {
  const nombre = values.nombre.trim();
  return {
    Nombre: nombre,
    Email: values.email.trim(),
    Perfil_de_Juego: values.perfil.trim(),
    Mania_Propia: values.mania.trim(),
    Himno_o_Frase: values.lema.trim(),
    subject: `🚀 Personaje Órbita-X: ${nombre}`,
    from_name: 'Gala Estelar Órbita-X',
  };
}

export function buildRumorPayload(values: RumorFormValues): Record<string, string> {
  const objetivo = values.objetivo.trim();
  const resolvedAuthor = values.anonymous || !values.autor.trim() ? 'Anónimo' : values.autor.trim();

  return {
    Invitado_Objetivo: objetivo,
    Informante_Secreto: resolvedAuthor,
    'Mania_o_Anécdota': values.mania.trim(),
    Talon_de_Aquiles_o_Soborno: values.soborno.trim(),
    Rumor_para_Lady_Nebula: values.chisme.trim(),
    subject: `👁️ Rumor Lady Nebula sobre ${objetivo} (por ${resolvedAuthor})`,
    from_name: 'Buzón de Lady Nebula',
  };
}

export function hasErrors<T extends object>(errors: ValidationErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}
