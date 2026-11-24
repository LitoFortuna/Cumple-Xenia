import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCharacterPayload,
  buildRumorPayload,
  computeCountdown,
  hasErrors,
  padTwo,
  validateCharacterForm,
  validateRumorForm,
} from './orbitaLogic';

test('computeCountdown calculates exact days, hours, minutes, and seconds for future dates', () => {
  const target = '2027-01-03T17:00:00+01:00';
  const targetMs = new Date(target).getTime();
  // Exactly 2 days, 3 hours, 4 minutes, 5 seconds before target
  const offsetMs = ((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000;
  const result = computeCountdown(target, targetMs - offsetMs);

  assert.equal(result.isPast, false);
  assert.equal(result.days, 2);
  assert.equal(result.hours, 3);
  assert.equal(result.minutes, 4);
  assert.equal(result.seconds, 5);
});

test('computeCountdown clamps past dates to zero and marks isPast true', () => {
  const target = '2027-01-03T17:00:00+01:00';
  const afterMs = new Date(target).getTime() + 60_000;
  const result = computeCountdown(target, afterMs);

  assert.equal(result.isPast, true);
  assert.equal(result.days, 0);
  assert.equal(result.hours, 0);
  assert.equal(result.minutes, 0);
  assert.equal(result.seconds, 0);
});

test('padTwo pads single digits cleanly', () => {
  assert.equal(padTwo(0), '00');
  assert.equal(padTwo(7), '07');
  assert.equal(padTwo(23), '23');
});

test('validateCharacterForm rejects incomplete or invalid email entries', () => {
  const emptyErrors = validateCharacterForm({
    nombre: '',
    email: 'invalid-email',
    perfil: '',
    mania: 'a',
    lema: '',
  });

  assert.equal(hasErrors(emptyErrors), true);
  assert.ok(emptyErrors.nombre);
  assert.ok(emptyErrors.email);
  assert.ok(emptyErrors.perfil);
  assert.ok(emptyErrors.mania);
  assert.ok(emptyErrors.lema);
});

test('validateCharacterForm accepts valid character data and builds expected Web3Forms payload', () => {
  const values = {
    nombre: 'Irene',
    email: 'irene@example.com',
    perfil: 'Espía / Cotilla',
    mania: 'Siempre observa todo desde la esquina',
    lema: 'No he dicho nada, pero lo sé todo',
  };

  const errors = validateCharacterForm(values);
  assert.equal(hasErrors(errors), false);

  const payload = buildCharacterPayload(values);
  assert.equal(payload.Nombre, 'Irene');
  assert.equal(payload.Email, 'irene@example.com');
  assert.equal(payload.Perfil_de_Juego, 'Espía / Cotilla');
  assert.equal(payload.subject, '🚀 Personaje Órbita-X: Irene');
  assert.equal(payload.from_name, 'Gala Estelar Órbita-X');
});

test('validateRumorForm enforces required target and mania, and respects anonymous mode', () => {
  const invalid = validateRumorForm({
    objetivo: '',
    autor: '',
    anonymous: true,
    mania: 'hey',
    soborno: '',
    chisme: '',
  });
  assert.equal(hasErrors(invalid), true);
  assert.ok(invalid.objetivo);
  assert.ok(invalid.mania);

  const anonymousPayload = buildRumorPayload({
    objetivo: 'Mike',
    autor: 'Irene',
    anonymous: true,
    mania: 'Intenta entrenarte aunque solo le pidas la hora',
    soborno: 'Con un buen dulce',
    chisme: 'Esconde pesas en la bodega de carga',
  });
  assert.equal(anonymousPayload.Informante_Secreto, 'Anónimo');
  assert.equal(anonymousPayload.subject, '👁️ Rumor Lady Nebula sobre Mike (por Anónimo)');

  const namedPayload = buildRumorPayload({
    objetivo: 'Bob',
    autor: 'Irene',
    anonymous: false,
    mania: 'Llega siempre 10 minutos antes a todas partes',
    soborno: '',
    chisme: '',
  });
  assert.equal(namedPayload.Informante_Secreto, 'Irene');
  assert.equal(namedPayload.subject, '👁️ Rumor Lady Nebula sobre Bob (por Irene)');
});
