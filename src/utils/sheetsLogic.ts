import type { CharacterFormValues, RumorFormValues } from './orbitaLogic';

export const DEFAULT_SPREADSHEET_TITLE = 'Órbita-X — Gala Estelar 3027';
export const CHARACTERS_SHEET_TITLE = 'Personajes';
export const RUMORS_SHEET_TITLE = 'Rumores Lady Nebula';

export const CHARACTER_HEADERS = [
  'Fecha',
  'Nombre',
  'Email',
  'Perfil de Juego',
  'Manía Propia',
  'Himno o Frase',
] as const;

export const RUMOR_HEADERS = [
  'Fecha',
  'Invitado Objetivo',
  'Informante Secreto',
  'Manía o Anécdota',
  'Talón de Aquiles / Soborno',
  'Rumor para Lady Nebula',
] as const;

const SPREADSHEET_URL_REGEX = /\/spreadsheets\/d\/([a-zA-Z0-9-_]{15,})/;
const RAW_ID_REGEX = /^[a-zA-Z0-9-_]{15,120}$/;

/**
 * Extracts a Google Spreadsheet ID from either a full Google Sheets URL
 * or a raw spreadsheet ID string. Returns null when invalid.
 */
export function extractSpreadsheetId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(SPREADSHEET_URL_REGEX);
  if (urlMatch?.[1]) {
    return urlMatch[1];
  }

  if (RAW_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Formats an A1 range with single quotes around sheet titles to safely handle spaces.
 */
export function quoteSheetRange(sheetTitle: string, cellRange: string): string {
  const escapedTitle = sheetTitle.replace(/'/g, "''");
  return `'${escapedTitle}'!${cellRange}`;
}

export function formatSheetTimestamp(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function buildCharacterSheetRow(
  values: CharacterFormValues,
  timestamp: string = formatSheetTimestamp()
): string[] {
  return [
    timestamp,
    values.nombre.trim(),
    values.email.trim(),
    values.perfil.trim(),
    values.mania.trim(),
    values.lema.trim(),
  ];
}

export function buildRumorSheetRow(
  values: RumorFormValues,
  timestamp: string = formatSheetTimestamp()
): string[] {
  const resolvedAuthor =
    values.anonymous || !values.autor.trim() ? 'Anónimo' : values.autor.trim();

  return [
    timestamp,
    values.objetivo.trim(),
    resolvedAuthor,
    values.mania.trim(),
    values.soborno.trim(),
    values.chisme.trim(),
  ];
}

export function findMissingSheetTitles(existingTitles: string[]): string[] {
  const existingSet = new Set(existingTitles);
  const required = [CHARACTERS_SHEET_TITLE, RUMORS_SHEET_TITLE];
  return required.filter((title) => !existingSet.has(title));
}

export function buildSpreadsheetUrl(spreadsheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/edit`;
}
