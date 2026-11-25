import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  clearCachedAccessToken,
  getAccessToken,
  googleSignIn,
  initAuth,
  logout,
} from '../utils/googleAuth';
import {
  SheetsAuthExpiredError,
  appendRowToSheet,
  createOrbitaSpreadsheet,
  ensureOrbitaTabs,
  inspectSpreadsheet,
  readSheetCounts,
  type ConnectedSpreadsheet,
  type SheetCounts,
} from '../utils/googleSheets';
import {
  CHARACTERS_SHEET_TITLE,
  DEFAULT_SPREADSHEET_TITLE,
  RUMORS_SHEET_TITLE,
  buildCharacterSheetRow,
  buildRumorSheetRow,
  extractSpreadsheetId,
  findMissingSheetTitles,
} from '../utils/sheetsLogic';
import type { CharacterFormValues, RumorFormValues } from '../utils/orbitaLogic';
import type { SheetsConfirmationRequest } from '../components/SheetsConfirmModal';

const STORAGE_SHEET_KEY = 'orbita_x_google_sheet_v1';

interface StoredSheetMeta {
  spreadsheetId: string;
  title: string;
}

function readStoredSheetMeta(): StoredSheetMeta | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_SHEET_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSheetMeta>;
    if (typeof parsed.spreadsheetId === 'string' && parsed.spreadsheetId.trim()) {
      return {
        spreadsheetId: parsed.spreadsheetId.trim(),
        title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title : DEFAULT_SPREADSHEET_TITLE,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function writeStoredSheetMeta(meta: StoredSheetMeta | null): void {
  try {
    if (!meta) {
      window.localStorage.removeItem(STORAGE_SHEET_KEY);
    } else {
      window.localStorage.setItem(STORAGE_SHEET_KEY, JSON.stringify(meta));
    }
  } catch {
    // Ignore storage quota errors
  }
}

interface PendingAction {
  request: SheetsConfirmationRequest;
  execute: () => Promise<void>;
  onCancel?: () => void;
}

export interface GoogleSheetsController {
  user: User | null;
  isSignedIn: boolean;
  isLoggingIn: boolean;
  spreadsheet: ConnectedSpreadsheet | null;
  counts: SheetCounts | null;
  isRefreshingCounts: boolean;
  isBusy: boolean;
  error: string | null;
  pendingConfirmation: SheetsConfirmationRequest | null;
  clearError: () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  disconnectSpreadsheet: () => void;
  refreshCounts: () => Promise<void>;
  requestCreateSpreadsheet: () => void;
  connectExistingSpreadsheet: (urlOrId: string) => Promise<void>;
  requestSaveCharacter: (values: CharacterFormValues, onSaved: () => void) => void;
  requestSaveRumor: (values: RumorFormValues, onSaved: () => void) => void;
  confirmPendingAction: () => Promise<void>;
  cancelPendingAction: () => void;
}

export function useGoogleSheets(): GoogleSheetsController {
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [spreadsheet, setSpreadsheet] = useState<ConnectedSpreadsheet | null>(() => {
    const saved = readStoredSheetMeta();
    if (!saved) return null;
    return {
      spreadsheetId: saved.spreadsheetId,
      title: saved.title,
      sheetTitles: [CHARACTERS_SHEET_TITLE, RUMORS_SHEET_TITLE],
    };
  });
  const [counts, setCounts] = useState<SheetCounts | null>(null);
  const [isRefreshingCounts, setIsRefreshingCounts] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const pendingActionRef = useRef<PendingAction | null>(null);
  pendingActionRef.current = pendingAction;

  const handleAuthError = useCallback((err: unknown) => {
    if (err instanceof SheetsAuthExpiredError) {
      clearCachedAccessToken();
      setHasToken(false);
      setError(err.message);
      return;
    }
    const message =
      err instanceof Error ? err.message : 'Ocurrió un error al conectar con Google Sheets.';
    setError(message);
  }, []);

  const refreshCountsFor = useCallback(
    async (token: string, spreadsheetId: string) => {
      setIsRefreshingCounts(true);
      try {
        const nextCounts = await readSheetCounts(token, spreadsheetId);
        setCounts(nextCounts);
      } catch (err) {
        handleAuthError(err);
      } finally {
        setIsRefreshingCounts(false);
      }
    },
    [handleAuthError]
  );

  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser, token) => {
        setUser(authedUser);
        setHasToken(Boolean(token));
      },
      () => {
        setUser(null);
        setHasToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (hasToken && token && spreadsheet?.spreadsheetId) {
      void refreshCountsFor(token, spreadsheet.spreadsheetId);
    }
  }, [hasToken, spreadsheet?.spreadsheetId, refreshCountsFor]);

  const signIn = useCallback(async () => {
    setError(null);
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      setUser(result.user);
      setHasToken(true);
      if (spreadsheet?.spreadsheetId) {
        void refreshCountsFor(result.accessToken, spreadsheet.spreadsheetId);
      }
    } catch (err) {
      const message =
        err instanceof Error && err.message.includes('popup-closed-by-user')
          ? 'Inicio de sesión cancelado.'
          : err instanceof Error
            ? err.message
            : 'No se pudo iniciar sesión con Google.';
      setError(message);
    } finally {
      setIsLoggingIn(false);
    }
  }, [spreadsheet?.spreadsheetId, refreshCountsFor]);

  const signOut = useCallback(async () => {
    setError(null);
    await logout();
    setUser(null);
    setHasToken(false);
    setCounts(null);
  }, []);

  const disconnectSpreadsheet = useCallback(() => {
    setSpreadsheet(null);
    setCounts(null);
    setError(null);
    writeStoredSheetMeta(null);
  }, []);

  const refreshCounts = useCallback(async () => {
    const token = getAccessToken();
    if (!token || !spreadsheet?.spreadsheetId) return;
    await refreshCountsFor(token, spreadsheet.spreadsheetId);
  }, [spreadsheet?.spreadsheetId, refreshCountsFor]);

  const requestCreateSpreadsheet = useCallback(() => {
    setError(null);
    const token = getAccessToken();
    if (!token) {
      setError('Inicia sesión con Google primero para crear tu hoja de cálculo.');
      return;
    }

    setPendingAction({
      request: {
        title: '¿Crear nueva hoja de cálculo?',
        description:
          'Se creará un documento nuevo en tu cuenta de Google Sheets con pestañas separadas para Personajes y Rumores de Lady Nebula.',
        confirmLabel: 'Confirmar y crear hoja',
        details: [
          { label: 'Nombre del documento', value: DEFAULT_SPREADSHEET_TITLE },
          {
            label: 'Pestañas incluidas',
            value: `${CHARACTERS_SHEET_TITLE} · ${RUMORS_SHEET_TITLE}`,
          },
          { label: 'Correos automáticos', value: 'Desactivados (solo guardado en Sheets)' },
        ],
      },
      execute: async () => {
        const freshToken = getAccessToken();
        if (!freshToken) throw new SheetsAuthExpiredError();
        const created = await createOrbitaSpreadsheet(freshToken, DEFAULT_SPREADSHEET_TITLE);
        setSpreadsheet(created);
        writeStoredSheetMeta({ spreadsheetId: created.spreadsheetId, title: created.title });
        setCounts({ charactersCount: 0, rumorsCount: 0 });
      },
    });
  }, []);

  const connectExistingSpreadsheet = useCallback(
    async (urlOrId: string) => {
      setError(null);
      const token = getAccessToken();
      if (!token) {
        setError('Inicia sesión con Google primero para conectar una hoja existente.');
        return;
      }

      const spreadsheetId = extractSpreadsheetId(urlOrId);
      if (!spreadsheetId) {
        setError('Pega un enlace válido de Google Sheets o el ID de la hoja de cálculo.');
        return;
      }

      setIsBusy(true);
      try {
        const metadata = await inspectSpreadsheet(token, spreadsheetId);
        const missingTabs = findMissingSheetTitles(metadata.sheetTitles);

        if (missingTabs.length === 0) {
          setSpreadsheet(metadata);
          writeStoredSheetMeta({ spreadsheetId: metadata.spreadsheetId, title: metadata.title });
          await refreshCountsFor(token, metadata.spreadsheetId);
          return;
        }

        // Ask explicit confirmation before creating tabs or header rows in user's existing spreadsheet
        setPendingAction({
          request: {
            title: `¿Preparar "${metadata.title}"?`,
            description:
              'Esta hoja todavía no tiene las pestañas de Órbita-X. Si confirmas, añadiremos las pestañas necesarias sin borrar tus datos actuales.',
            confirmLabel: 'Confirmar y preparar hoja',
            details: [
              { label: 'Hoja seleccionada', value: metadata.title },
              { label: 'Pestañas a crear', value: missingTabs.join(' · ') },
            ],
          },
          execute: async () => {
            const freshToken = getAccessToken();
            if (!freshToken) throw new SheetsAuthExpiredError();
            const prepared = await ensureOrbitaTabs(freshToken, metadata.spreadsheetId);
            setSpreadsheet(prepared);
            writeStoredSheetMeta({ spreadsheetId: prepared.spreadsheetId, title: prepared.title });
            await refreshCountsFor(freshToken, prepared.spreadsheetId);
          },
        });
      } catch (err) {
        handleAuthError(err);
      } finally {
        setIsBusy(false);
      }
    },
    [handleAuthError, refreshCountsFor]
  );

  const requestSaveCharacter = useCallback(
    (values: CharacterFormValues, onSaved: () => void) => {
      setError(null);
      const token = getAccessToken();
      if (!token) {
        setError('Inicia sesión con Google en el panel superior para guardar tu personaje en Google Sheets.');
        return;
      }
      if (!spreadsheet?.spreadsheetId) {
        setError('Crea o conecta primero una hoja de Google Sheets para guardar el registro.');
        return;
      }

      const targetSheet = spreadsheet;
      setPendingAction({
        request: {
          title: `¿Guardar el registro de ${values.nombre.trim()}?`,
          description:
            'Se añadirá una nueva fila en Google Sheets con los datos de este personaje. No se enviará ningún correo automático.',
          confirmLabel: 'Confirmar y guardar',
          details: [
            { label: 'Hoja de destino', value: targetSheet.title },
            { label: 'Pestaña', value: CHARACTERS_SHEET_TITLE },
            { label: 'Invitado/a', value: values.nombre.trim() },
            { label: 'Perfil de juego', value: values.perfil.trim() },
          ],
        },
        execute: async () => {
          const freshToken = getAccessToken();
          if (!freshToken) throw new SheetsAuthExpiredError();
          await ensureOrbitaTabs(freshToken, targetSheet.spreadsheetId);
          const row = buildCharacterSheetRow(values);
          await appendRowToSheet(
            freshToken,
            targetSheet.spreadsheetId,
            CHARACTERS_SHEET_TITLE,
            row
          );
          await refreshCountsFor(freshToken, targetSheet.spreadsheetId);
          onSaved();
        },
      });
    },
    [spreadsheet, refreshCountsFor]
  );

  const requestSaveRumor = useCallback(
    (values: RumorFormValues, onSaved: () => void) => {
      setError(null);
      const token = getAccessToken();
      if (!token) {
        setError('Inicia sesión con Google en el panel superior para guardar tu soplo en Google Sheets.');
        return;
      }
      if (!spreadsheet?.spreadsheetId) {
        setError('Crea o conecta primero una hoja de Google Sheets para archivar el rumor.');
        return;
      }

      const targetSheet = spreadsheet;
      const authorLabel =
        values.anonymous || !values.autor.trim() ? 'Anónimo' : values.autor.trim();

      setPendingAction({
        request: {
          title: `¿Guardar soplo sobre ${values.objetivo.trim()}?`,
          description:
            'Se añadirá una nueva fila en la pestaña del Buzón de Lady Nebula dentro de tu Google Sheet. No se enviará ningún correo automático.',
          confirmLabel: 'Confirmar y guardar',
          details: [
            { label: 'Hoja de destino', value: targetSheet.title },
            { label: 'Pestaña', value: RUMORS_SHEET_TITLE },
            { label: 'Objetivo', value: values.objetivo.trim() },
            { label: 'Informante', value: authorLabel },
          ],
        },
        execute: async () => {
          const freshToken = getAccessToken();
          if (!freshToken) throw new SheetsAuthExpiredError();
          await ensureOrbitaTabs(freshToken, targetSheet.spreadsheetId);
          const row = buildRumorSheetRow(values);
          await appendRowToSheet(
            freshToken,
            targetSheet.spreadsheetId,
            RUMORS_SHEET_TITLE,
            row
          );
          await refreshCountsFor(freshToken, targetSheet.spreadsheetId);
          onSaved();
        },
      });
    },
    [spreadsheet, refreshCountsFor]
  );

  const confirmPendingAction = useCallback(async () => {
    const action = pendingActionRef.current;
    if (!action) return;
    setIsBusy(true);
    setError(null);
    try {
      await action.execute();
      setPendingAction(null);
    } catch (err) {
      setPendingAction(null);
      handleAuthError(err);
    } finally {
      setIsBusy(false);
    }
  }, [handleAuthError]);

  const cancelPendingAction = useCallback(() => {
    if (isBusy) return;
    pendingActionRef.current?.onCancel?.();
    setPendingAction(null);
  }, [isBusy]);

  return {
    user,
    isSignedIn: Boolean(user && hasToken),
    isLoggingIn,
    spreadsheet,
    counts,
    isRefreshingCounts,
    isBusy,
    error,
    pendingConfirmation: pendingAction?.request ?? null,
    clearError: () => setError(null),
    signIn,
    signOut,
    disconnectSpreadsheet,
    refreshCounts,
    requestCreateSpreadsheet,
    connectExistingSpreadsheet,
    requestSaveCharacter,
    requestSaveRumor,
    confirmPendingAction,
    cancelPendingAction,
  };
}
