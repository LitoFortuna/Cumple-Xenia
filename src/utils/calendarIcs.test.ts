import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGalaCalendarIcs } from './calendarIcs';

test('buildGalaCalendarIcs produces valid RFC 5545 VCALENDAR with exact UTC times and CRLF endings', () => {
  const fixedNow = new Date('2026-11-25T18:00:00Z');
  const ics = buildGalaCalendarIcs(fixedNow);

  assert.ok(ics.includes('BEGIN:VCALENDAR\r\n'));
  assert.ok(ics.includes('BEGIN:VEVENT\r\n'));
  assert.ok(ics.includes('DTSTAMP:20261125T180000Z\r\n'));
  // 17:00 CET (+01:00) on Jan 3, 2027 is 16:00 UTC
  assert.ok(ics.includes('DTSTART:20270103T160000Z\r\n'));
  assert.ok(ics.includes('DTEND:20270103T180000Z\r\n'));
  assert.ok(ics.includes('SUMMARY:Cumpleaños de Xenia · Gala Estelar Órbita-X\r\n'));
  assert.ok(ics.includes('LOCATION:Nuestra casa\\, Molins de Rei\r\n'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
});
