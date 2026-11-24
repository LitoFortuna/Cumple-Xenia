import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_VOLUME,
  INITIAL_AUDIO_STATE,
  MAX_AMBIENT_GAIN,
  clampVolume,
  getAudioButtonAriaLabel,
  getVolumePercent,
  setVolumeState,
  toggleMuteState,
  volumeToGain,
} from './audioState';

test('clampVolume bounds values strictly within [0, 1]', () => {
  assert.equal(clampVolume(-0.4), 0);
  assert.equal(clampVolume(1.8), 1);
  assert.equal(clampVolume(0.456), 0.46);
  assert.equal(clampVolume(Number.NaN), DEFAULT_VOLUME);
});

test('volumeToGain returns 0 when muted and uses subtle quadratic curve when active', () => {
  assert.equal(volumeToGain(0.8, true), 0);
  assert.equal(volumeToGain(0, false), 0);
  assert.equal(volumeToGain(1, false), MAX_AMBIENT_GAIN);
  assert.equal(volumeToGain(0.5, false), Number((0.25 * MAX_AMBIENT_GAIN).toFixed(5)));
});

test('toggleMuteState activates sound from initial muted state and remembers last volume', () => {
  const active = toggleMuteState(INITIAL_AUDIO_STATE);
  assert.equal(active.isPlaying, true);
  assert.equal(active.isMuted, false);
  assert.equal(active.volume, DEFAULT_VOLUME);

  const louder = setVolumeState(active, 0.72);
  assert.equal(louder.volume, 0.72);
  assert.equal(louder.isMuted, false);

  const muted = toggleMuteState(louder);
  assert.equal(muted.isMuted, true);
  assert.equal(muted.lastNonZeroVolume, 0.72);
  assert.equal(getVolumePercent(muted), 0);

  const unmuted = toggleMuteState(muted);
  assert.equal(unmuted.isMuted, false);
  assert.equal(unmuted.volume, 0.72);
  assert.equal(getVolumePercent(unmuted), 72);
});

test('setVolumeState auto-mutes at 0 and restores previous non-zero volume on unmute', () => {
  const active = setVolumeState(INITIAL_AUDIO_STATE, 0.6);
  const draggedToZero = setVolumeState(active, 0);
  assert.equal(draggedToZero.isMuted, true);
  assert.equal(draggedToZero.volume, 0);
  assert.equal(draggedToZero.lastNonZeroVolume, 0.6);

  const restored = toggleMuteState(draggedToZero);
  assert.equal(restored.isMuted, false);
  assert.equal(restored.volume, 0.6);
});

test('getAudioButtonAriaLabel reflects active percentage or muted state', () => {
  assert.equal(getAudioButtonAriaLabel(INITIAL_AUDIO_STATE), 'Activar sonido ambiental de la gala');
  const active = setVolumeState(INITIAL_AUDIO_STATE, 0.5);
  assert.equal(
    getAudioButtonAriaLabel(active),
    'Sonido ambiental activo (50%). Abrir control de volumen'
  );
});
