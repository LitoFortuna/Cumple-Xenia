import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const blueprintPath = path.resolve(process.cwd(), 'firebase-blueprint.json');
const rulesText = fs.readFileSync(rulesPath, 'utf8');
const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8')) as {
  entities: Record<string, { properties: Record<string, { maxLength?: number; minLength?: number }>; required?: string[] }>;
  firestore: Record<string, unknown>;
};

test('firestore.rules enforces rules_version 2 and default-deny catch-all', () => {
  assert.match(rulesText, /rules_version\s*=\s*'2';/);
  assert.match(rulesText, /match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;\s*\}/);
});

test('every collection in firebase-blueprint.json has an explicit match block in firestore.rules', () => {
  for (const collectionPath of Object.keys(blueprint.firestore)) {
    const cleanPath = collectionPath.replace(/^\//, '');
    assert.ok(
      rulesText.includes(`match /${cleanPath}`),
      `Missing match block for blueprint path: ${collectionPath}`
    );
  }
});

test('email spoofing guard enforces email_verified == true on organizer check', () => {
  assert.ok(rulesText.includes('request.auth.token.email_verified == true'));
  assert.ok(rulesText.includes("request.auth.token.email == 'raulfdz3@gmail.com'"));
});

test('no blanket signed-in reads or list queries exist in firestore.rules', () => {
  assert.doesNotMatch(rulesText, /allow\s+(read|get|list)\s*:\s*if\s+(true|isSignedIn\(\))\s*;/);
});

test('create rules reject shadow fields, forged sync flags, and client timestamps', () => {
  assert.ok(rulesText.includes("data.keys().hasOnly(['nombre', 'email', 'perfil', 'mania', 'lema', 'syncedToSheets', 'createdAt'])"));
  assert.ok(rulesText.includes("data.keys().hasOnly(['objetivo', 'autor', 'anonymous', 'mania', 'soborno', 'chisme', 'syncedToSheets', 'createdAt'])"));
  assert.ok(rulesText.includes('data.syncedToSheets == false'));
  assert.ok(rulesText.includes('data.createdAt == request.time'));
});

test('update rules enforce validation helpers, immutable createdAt, and strict affectedKeys allowlists', () => {
  assert.ok(rulesText.includes('isValidCharacterSubmissionUpdate(incoming())'));
  assert.ok(rulesText.includes('isValidRumorSubmissionUpdate(incoming())'));
  assert.ok(rulesText.includes('incoming().createdAt == existing().createdAt'));
  assert.ok(rulesText.includes("affectedKeys().hasOnly(['syncedToSheets', 'syncedAt'])"));
});

test('blueprint maxLength constraints stay synchronized with firestore.rules', () => {
  const charProps = blueprint.entities.CharacterSubmission.properties;
  assert.ok(rulesText.includes(`data.nombre.size() <= ${charProps.nombre.maxLength}`));
  assert.ok(rulesText.includes(`data.mania.size() <= ${charProps.mania.maxLength}`));
  assert.ok(rulesText.includes(`data.lema.size() <= ${charProps.lema.maxLength}`));

  const rumorProps = blueprint.entities.RumorSubmission.properties;
  assert.ok(rulesText.includes(`data.mania.size() <= ${rumorProps.mania.maxLength}`));
  assert.ok(rulesText.includes(`data.soborno.size() <= ${rumorProps.soborno.maxLength}`));
  assert.ok(rulesText.includes(`data.chisme.size() <= ${rumorProps.chisme.maxLength}`));
});
