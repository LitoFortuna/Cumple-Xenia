import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EMPTY_GUEST_PROGRESS,
  getCompletedStepsCount,
  getProgressStage,
  parseGuestProgress,
  recordStep1Completed,
  recordStep2Rumor,
} from './guestProgress';

test('parseGuestProgress returns empty defaults for null or malformed JSON', () => {
  assert.deepEqual(parseGuestProgress(null), EMPTY_GUEST_PROGRESS);
  assert.deepEqual(parseGuestProgress('{not valid json'), EMPTY_GUEST_PROGRESS);
});

test('recordStep1Completed and recordStep2Rumor progress cleanly through all 3 stages', () => {
  assert.equal(getProgressStage(EMPTY_GUEST_PROGRESS), 'none');
  assert.equal(getCompletedStepsCount(EMPTY_GUEST_PROGRESS), 0);

  const afterStep1 = recordStep1Completed(
    EMPTY_GUEST_PROGRESS,
    'Raúl',
    'Estratega / Manipulador',
    '2026-11-25T12:00:00.000Z'
  );
  assert.equal(afterStep1.step1Completed, true);
  assert.equal(afterStep1.guestName, 'Raúl');
  assert.equal(afterStep1.archetype, 'Estratega / Manipulador');
  assert.equal(getProgressStage(afterStep1), 'step1-only');
  assert.equal(getCompletedStepsCount(afterStep1), 1);

  const afterRumor1 = recordStep2Rumor(afterStep1, 'Mike', '2026-11-25T12:05:00.000Z');
  assert.equal(afterRumor1.rumorCount, 1);
  assert.deepEqual(afterRumor1.rumorTargets, ['Mike']);
  assert.equal(getProgressStage(afterRumor1), 'all-done');
  assert.equal(getCompletedStepsCount(afterRumor1), 2);

  // Sending a second rumor about the same target increments rumorCount without duplicating target name
  const afterRumor2 = recordStep2Rumor(afterRumor1, 'Mike', '2026-11-25T12:06:00.000Z');
  assert.equal(afterRumor2.rumorCount, 2);
  assert.deepEqual(afterRumor2.rumorTargets, ['Mike']);
});

test('parseGuestProgress round-trips serialized progress safely', () => {
  const populated = recordStep2Rumor(
    recordStep1Completed(EMPTY_GUEST_PROGRESS, 'Irene', 'Espía / Cotilla'),
    'Bob'
  );
  const restored = parseGuestProgress(JSON.stringify(populated));
  assert.equal(restored.step1Completed, true);
  assert.equal(restored.guestName, 'Irene');
  assert.equal(restored.archetype, 'Espía / Cotilla');
  assert.equal(restored.rumorCount, 1);
  assert.deepEqual(restored.rumorTargets, ['Bob']);
});
