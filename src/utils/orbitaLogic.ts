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

export const FIELD_LIMITS = {
  character: {
    nombreMax: 80,
    emailMax: 160,
    perfilMax: 80,
    maniaMin: 3,
    maniaMax: 400,
    lemaMin: 2,
    lemaMax: 300,
  },
  rumor: {
    objetivoMax: 80,
    autorMax: 80,
    maniaMin: 5,
    maniaMax: 800,
    sobornoMax: 400,
    chismeMax: 800,
  },
} as const;

export function isOrganizerEmail(email: string | null | undefined, organizerEmail: string): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === organizerEmail.trim().toLowerCase();
}

export function validateCharacterForm(values: CharacterFormValues): ValidationErrors<CharacterFormValues> {
  const errors: ValidationErrors<CharacterFormValues> = {};
  const nombre = values.nombre.trim();
  const email = values.email.trim();
  const perfil = values.perfil.trim();
  const mania = values.mania.trim();
  const lema = values.lema.trim();

  if (!nombre) {
    errors.nombre = 'Selecciona tu nombre en la lista de pasajeros.';
  } else if (nombre.length > FIELD_LIMITS.character.nombreMax) {
    errors.nombre = `El nombre no puede superar ${FIELD_LIMITS.character.nombreMax} caracteres.`;
  }

  if (!email) {
    errors.email = 'Necesitamos tu correo para enviarte tu ficha secreta.';
  } else if (email.length > FIELD_LIMITS.character.emailMax || !EMAIL_PATTERN.test(email)) {
    errors.email = 'Introduce un correo electrónico válido.';
  }

  if (!perfil) {
    errors.perfil = 'Elige el estilo de personaje que quieres interpretar.';
  } else if (perfil.length > FIELD_LIMITS.character.perfilMax) {
    errors.perfil = 'El perfil seleccionado no es válido.';
  }

  if (mania.length < FIELD_LIMITS.character.maniaMin) {
    errors.mania = 'Confiesa al menos una manía o vicio breve.';
  } else if (mania.length > FIELD_LIMITS.character.maniaMax) {
    errors.mania = `Máximo ${FIELD_LIMITS.character.maniaMax} caracteres.`;
  }

  if (lema.length < FIELD_LIMITS.character.lemaMin) {
    errors.lema = 'Añade una canción o frase himno para tu personaje.';
  } else if (lema.length > FIELD_LIMITS.character.lemaMax) {
    errors.lema = `Máximo ${FIELD_LIMITS.character.lemaMax} caracteres.`;
  }

  return errors;
}

export function validateRumorForm(values: RumorFormValues): ValidationErrors<RumorFormValues> {
  const errors: ValidationErrors<RumorFormValues> = {};
  const objetivo = values.objetivo.trim();
  const mania = values.mania.trim();

  if (!objetivo) {
    errors.objetivo = 'Selecciona sobre qué invitado vas a escribir.';
  } else if (objetivo.length > FIELD_LIMITS.rumor.objetivoMax) {
    errors.objetivo = 'El invitado seleccionado no es válido.';
  }

  if (!values.anonymous && values.autor.trim().length > FIELD_LIMITS.rumor.autorMax) {
    errors.autor = `Máximo ${FIELD_LIMITS.rumor.autorMax} caracteres.`;
  }

  if (mania.length < FIELD_LIMITS.rumor.maniaMin) {
    errors.mania = 'Cuéntanos una manía o anécdota con un poco más de detalle.';
  } else if (mania.length > FIELD_LIMITS.rumor.maniaMax) {
    errors.mania = `Máximo ${FIELD_LIMITS.rumor.maniaMax} caracteres.`;
  }

  if (values.soborno.trim().length > FIELD_LIMITS.rumor.sobornoMax) {
    errors.soborno = `Máximo ${FIELD_LIMITS.rumor.sobornoMax} caracteres.`;
  }

  if (values.chisme.trim().length > FIELD_LIMITS.rumor.chismeMax) {
    errors.chisme = `Máximo ${FIELD_LIMITS.rumor.chismeMax} caracteres.`;
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
