import { EVENT_CONFIG } from '../data/eventData';

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function formatUtcStamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/**
 * Generates an RFC 5545 .ics calendar event for the gala (Sunday Jan 3, 2027, 17:00-19:00 CET)
 * without revealing plot spoilers in case Xenia glances at a shared calendar.
 */
export function buildGalaCalendarIcs(now: Date = new Date()): string {
  const startUtc = new Date('2027-01-03T17:00:00+01:00');
  const endUtc = new Date('2027-01-03T19:00:00+01:00');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Orbita-X//Gala Estelar 3027//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:orbita-x-gala-3027@molinsderei',
    `DTSTAMP:${formatUtcStamp(now)}`,
    `DTSTART:${formatUtcStamp(startUtc)}`,
    `DTEND:${formatUtcStamp(endUtc)}`,
    `SUMMARY:${escapeIcsText('Cumpleaños de Xenia · Gala Estelar Órbita-X')}`,
    `LOCATION:${escapeIcsText(EVENT_CONFIG.venueAddress)}`,
    `DESCRIPTION:${escapeIcsText('Gala Estelar del Ritmo 3027. Dress code: Gala Galáctica Urbana (base elegante + toque urbano/espacial). Duración estimada: 90-120 min.')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return `${lines.join('\r\n')}\r\n`;
}

export function downloadGalaCalendarFile(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const content = buildGalaCalendarIcs();
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'orbita-x-gala-3027.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
