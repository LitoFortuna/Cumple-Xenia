import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  FIELD_LIMITS,
  type CharacterFormValues,
  type RumorFormValues,
} from './orbitaLogic';

const CHARACTER_COLLECTION = 'characterSubmissions';
const RUMOR_COLLECTION = 'rumorSubmissions';
const ORGANIZER_CONFIG_COLLECTION = 'organizerConfig';
const ORGANIZER_SHEETS_DOC_ID = 'sheets';

export interface StoredCharacterSubmission {
  id: string;
  nombre: string;
  email: string;
  perfil: string;
  mania: string;
  lema: string;
  syncedToSheets: boolean;
  createdAt: Date | null;
  syncedAt: Date | null;
}

export interface StoredRumorSubmission {
  id: string;
  objetivo: string;
  autor: string;
  anonymous: boolean;
  mania: string;
  soborno: string;
  chisme: string;
  syncedToSheets: boolean;
  createdAt: Date | null;
  syncedAt: Date | null;
}

export interface StoredOrganizerSheetConfig {
  spreadsheetId: string;
  title: string;
  updatedBy: string;
}

function generateSubmissionId(prefix: 'char' | 'rumor'): string {
  const randomBytes = new Uint8Array(6);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < randomBytes.length; i += 1) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const hex = Array.from(randomBytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${Date.now()}_${hex}`;
}

function toDateOrNull(value: unknown): Date | null {
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as Timestamp).toDate === 'function') {
    return (value as Timestamp).toDate();
  }
  return null;
}

/**
 * Privately stores a guest character submission in Firestore (write-only for guests).
 */
export async function submitCharacterToVault(values: CharacterFormValues): Promise<string> {
  const submissionId = generateSubmissionId('char');
  const docPath = `${CHARACTER_COLLECTION}/${submissionId}`;

  const payload = {
    nombre: values.nombre.trim().slice(0, FIELD_LIMITS.character.nombreMax),
    email: values.email.trim().slice(0, FIELD_LIMITS.character.emailMax),
    perfil: values.perfil.trim().slice(0, FIELD_LIMITS.character.perfilMax),
    mania: values.mania.trim().slice(0, FIELD_LIMITS.character.maniaMax),
    lema: values.lema.trim().slice(0, FIELD_LIMITS.character.lemaMax),
    syncedToSheets: false,
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, CHARACTER_COLLECTION, submissionId), payload);
    return submissionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

/**
 * Privately stores a guest rumor submission in Firestore (write-only for guests).
 */
export async function submitRumorToVault(values: RumorFormValues): Promise<string> {
  const submissionId = generateSubmissionId('rumor');
  const docPath = `${RUMOR_COLLECTION}/${submissionId}`;
  const resolvedAuthor =
    values.anonymous || !values.autor.trim()
      ? 'Anónimo'
      : values.autor.trim().slice(0, FIELD_LIMITS.rumor.autorMax);

  const payload = {
    objetivo: values.objetivo.trim().slice(0, FIELD_LIMITS.rumor.objetivoMax),
    autor: resolvedAuthor,
    anonymous: Boolean(values.anonymous || !values.autor.trim()),
    mania: values.mania.trim().slice(0, FIELD_LIMITS.rumor.maniaMax),
    soborno: values.soborno.trim().slice(0, FIELD_LIMITS.rumor.sobornoMax),
    chisme: values.chisme.trim().slice(0, FIELD_LIMITS.rumor.chismeMax),
    syncedToSheets: false,
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, RUMOR_COLLECTION, submissionId), payload);
    return submissionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

/**
 * Organizer-only live subscription to all character submissions.
 */
export function subscribeCharacterSubmissions(
  onData: (items: StoredCharacterSubmission[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, CHARACTER_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const rows: StoredCharacterSubmission[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          nombre: String(data.nombre ?? ''),
          email: String(data.email ?? ''),
          perfil: String(data.perfil ?? ''),
          mania: String(data.mania ?? ''),
          lema: String(data.lema ?? ''),
          syncedToSheets: Boolean(data.syncedToSheets),
          createdAt: toDateOrNull(data.createdAt),
          syncedAt: toDateOrNull(data.syncedAt),
        };
      });
      onData(rows);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, CHARACTER_COLLECTION);
      } catch (wrapped) {
        onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

/**
 * Organizer-only live subscription to all rumor submissions.
 */
export function subscribeRumorSubmissions(
  onData: (items: StoredRumorSubmission[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, RUMOR_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const rows: StoredRumorSubmission[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          objetivo: String(data.objetivo ?? ''),
          autor: String(data.autor ?? 'Anónimo'),
          anonymous: Boolean(data.anonymous),
          mania: String(data.mania ?? ''),
          soborno: String(data.soborno ?? ''),
          chisme: String(data.chisme ?? ''),
          syncedToSheets: Boolean(data.syncedToSheets),
          createdAt: toDateOrNull(data.createdAt),
          syncedAt: toDateOrNull(data.syncedAt),
        };
      });
      onData(rows);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, RUMOR_COLLECTION);
      } catch (wrapped) {
        onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

/**
 * Marks a character submission as synced to the organizer's private Google Sheet.
 */
export async function markCharacterSynced(submissionId: string): Promise<void> {
  const docPath = `${CHARACTER_COLLECTION}/${submissionId}`;
  try {
    await updateDoc(doc(db, CHARACTER_COLLECTION, submissionId), {
      syncedToSheets: true,
      syncedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Marks a rumor submission as synced to the organizer's private Google Sheet.
 */
export async function markRumorSynced(submissionId: string): Promise<void> {
  const docPath = `${RUMOR_COLLECTION}/${submissionId}`;
  try {
    await updateDoc(doc(db, RUMOR_COLLECTION, submissionId), {
      syncedToSheets: true,
      syncedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Loads the organizer's private linked Google Sheet metadata from Firestore.
 */
export async function loadOrganizerSheetConfig(): Promise<StoredOrganizerSheetConfig | null> {
  const docPath = `${ORGANIZER_CONFIG_COLLECTION}/${ORGANIZER_SHEETS_DOC_ID}`;
  try {
    const snap = await getDoc(doc(db, ORGANIZER_CONFIG_COLLECTION, ORGANIZER_SHEETS_DOC_ID));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (typeof data.spreadsheetId !== 'string' || !data.spreadsheetId.trim()) return null;
    return {
      spreadsheetId: data.spreadsheetId.trim(),
      title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'Hoja Órbita-X',
      updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : '',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

/**
 * Saves the organizer's private Google Sheet ID and title in Firestore (never exposed to guests).
 */
export async function saveOrganizerSheetConfig(
  spreadsheetId: string,
  title: string,
  organizerEmail: string
): Promise<void> {
  const docPath = `${ORGANIZER_CONFIG_COLLECTION}/${ORGANIZER_SHEETS_DOC_ID}`;
  try {
    await setDoc(doc(db, ORGANIZER_CONFIG_COLLECTION, ORGANIZER_SHEETS_DOC_ID), {
      spreadsheetId: spreadsheetId.trim().slice(0, 120),
      title: title.trim().slice(0, 200),
      updatedBy: organizerEmail.trim().slice(0, 160),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Removes the stored Google Sheet link from the organizer's private Firestore config.
 */
export async function deleteOrganizerSheetConfig(): Promise<void> {
  const docPath = `${ORGANIZER_CONFIG_COLLECTION}/${ORGANIZER_SHEETS_DOC_ID}`;
  try {
    await deleteDoc(doc(db, ORGANIZER_CONFIG_COLLECTION, ORGANIZER_SHEETS_DOC_ID));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
