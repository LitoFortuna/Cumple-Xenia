import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHARACTERS_SHEET_TITLE,
  RUMORS_SHEET_TITLE,
  buildCharacterSheetRow,
  buildRumorSheetRow,
  extractSpreadsheetId,
  findMissingSheetTitles,
  quoteSheetRange,
} from './sheetsLogic';

test('extractSpreadsheetId extracts ID from full Google Sheets URLs and raw IDs', () => {
  assert.equal(
    extractSpreadsheetId(
      'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0'
    ),
    '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
  );
  assert.equal(
    extractSpreadsheetId('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'),
    '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
  );
  assert.equal(extractSpreadsheetId('https://example.com/not-a-sheet'), null);
  assert.equal(extractSpreadsheetId('short'), null);
  assert.equal(extractSpreadsheetId('   '), null);
});

test('quoteSheetRange quotes tab names with spaces and escapes single quotes', () => {
  assert.equal(quoteSheetRange(RUMORS_SHEET_TITLE, 'A:F'), "'Rumores Lady Nebula'!A:F");
  assert.equal(quoteSheetRange("Xenia's Sheet", 'A1:F1'), "'Xenia''s Sheet'!A1:F1");
});

test('buildCharacterSheetRow formats all 6 columns cleanly in order', () => {
  const row = buildCharacterSheetRow(
    {
      nombre: 'Raúl',
      email: 'raul@example.com',
      perfil: 'Estratega / Manipulador',
      mania: 'Siempre analiza las pistas',
      lema: 'El ritmo nunca miente',
    },
    '2026-11-24 20:00'
  );

  assert.deepEqual(row, [
    '2026-11-24 20:00',
    'Raúl',
    'raul@example.com',
    'Estratega / Manipulador',
    'Siempre analiza las pistas',
    'El ritmo nunca miente',
  ]);
});

test('buildRumorSheetRow enforces Anónimo when anonymous mode is enabled', () => {
  const anonymousRow = buildRumorSheetRow(
    {
      objetivo: 'Mike',
      autor: 'Raúl',
      anonymous: true,
      mania: 'Intenta entrenarte en cada pausa',
      soborno: 'Un buen dulce',
      chisme: 'Esconde mancuernas en la cabina',
    },
    '2026-11-24 20:05'
  );

  assert.equal(anonymousRow[1], 'Mike');
  assert.equal(anonymousRow[2], 'Anónimo');

  const namedRow = buildRumorSheetRow(
    {
      objetivo: 'Irene',
      autor: 'Raúl',
      anonymous: false,
      mania: 'Siempre sabe todos los secretos',
      soborno: '',
      chisme: '',
    },
    '2026-11-24 20:06'
  );
  assert.equal(namedRow[2], 'Raúl');
});

test('findMissingSheetTitles detects which required tabs need to be created', () => {
  assert.deepEqual(findMissingSheetTitles(['Hoja 1']), [
    CHARACTERS_SHEET_TITLE,
    RUMORS_SHEET_TITLE,
  ]);
  assert.deepEqual(findMissingSheetTitles([CHARACTERS_SHEET_TITLE]), [RUMORS_SHEET_TITLE]);
  assert.deepEqual(
    findMissingSheetTitles([CHARACTERS_SHEET_TITLE, RUMORS_SHEET_TITLE]),
    []
  );
});
