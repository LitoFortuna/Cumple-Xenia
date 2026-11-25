import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  appendRowsToSheet,
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
  formatSheetTimestamp,
} from '../utils/sheetsLogic';
import { isAuthorizedOrganizer, ORGANIZER_EMAIL } from '../utils/firebase';
import {
  deleteOrganizerSheetConfig,
  loadOrganizerSheetConfig,
  markCharacterSynced,
  markRumorSynced,
  saveOrganizerSheetConfig,
  subscribeCharacterSubmissions,
  subscribeRumorSubmissions,
  type StoredCharacterSubmission,
  type StoredRumorSubmission,
} from '../utils/submissionsStore';
import type { SheetsConfirmationRequest } from '../components/SheetsConfirmModal';

interface PendingAction {
  request: SheetsConfirmationRequest;
  execute: () => Promise<void>;
  onCancel?: () => void;
}

export interface OrganizerSheetsController {
  user: User | null;
  isSignedIn: boolean;
  isAuthorized: boolean;
  accessDenied: boolean;
  isLoggingIn: boolean;
  isLoadingData: boolean;
  spreadsheet: ConnectedSpreadsheet | null;
  sheetCounts: SheetCounts | null;
  isRefreshingCounts: boolean;
  characters: StoredCharacterSubmission[];
  rumors: StoredRumorSubmission[];
  pendingCharactersCount: number;
  pendingRumorsCount: number;
  totalPendingCount: number;
  isBusy: boolean;
  error: string | null;
  lastSyncSummary: string | null;
  pendingConfirmation: SheetsConfirmationRequest | null;
  clearError: () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  disconnectSpreadsheet: () => Promise<void>;
  refreshCounts: () => Promise<void>;
  requestCreateSpreadsheet: () => void;
  connectExistingSpreadsheet: (urlOrId: string) => Promise<void>;
  requestSyncPendingToSheets: () => void;
  confirmPendingAction: () => Promise<void>;
  cancelPendingAction: () => void;
}

export function useOrganizerSheets(isActive: boolean): OrganizerSheetsController {
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [spreadsheet, setSpreadsheet] = useState<ConnectedSpreadsheet | null>(null);
  const [sheetCounts, setSheetCounts] = useState<SheetCounts | null>(null);
  const [isRefreshingCounts, setIsRefreshingCounts] = useState(false);
  const [characters, setCharacters] = useState<StoredCharacterSubmission[]>([]);
  const [rumors, setRumors] = useState<StoredRumorSubmission[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncSummary, setLastSyncSummary] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const pendingActionRef = useRef<PendingAction | null>(null);
  pendingActionRef.current = pendingAction;

  const isSignedIn = Boolean(user && hasToken);
  const isAuthorized = Boolean(isSignedIn && isAuthorizedOrganizer(user));
  const accessDenied = Boolean(user && !isAuthorizedOrganizer(user));

  const pendingCharacters = useMemo(
    () => characters.filter((item) => !item.syncedToSheets),
    [characters]
  );
  const pendingRumors = useMemo(
    () => rumors.filter((item) => !item.syncedToSheets),
    [rumors]
  );

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
        setSheetCounts(nextCounts);
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
        if (isAuthorizedOrganizer(authedUser)) {
          setHasToken(Boolean(token));
        } else {
          clearCachedAccessToken();
          setHasToken(false);
        }
      },
      () => {
        setUser(null);
        setHasToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Only subscribe to private Firestore collections when the organizer panel is open AND user is verified organizer
  useEffect(() => {
    if (!isActive || !isAuthorized) {
      setCharacters([]);
      setRumors([]);
      setSpreadsheet(null);
      setSheetCounts(null);
      setIsLoadingData(false);
      return;
    }

    let cancelled = false;
    setIsLoadingData(true);
    setError(null);

    const loadConfig = async () => {
      try {
        const savedConfig = await loadOrganizerSheetConfig();
        if (cancelled) return;
        if (savedConfig) {
          setSpreadsheet({
            spreadsheetId: savedConfig.spreadsheetId,
            title: savedConfig.title,
            sheetTitles: [CHARACTERS_SHEET_TITLE, RUMORS_SHEET_TITLE],
          });
          const token = getAccessToken();
          if (token) {
            void refreshCountsFor(token, savedConfig.spreadsheetId);
          }
        } else {
          setSpreadsheet(null);
          setSheetCounts(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar la configuración privada de Google Sheets.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingData(false);
        }
      }
    };

    void loadConfig();

    const unsubChars = subscribeCharacterSubmissions(
      (items) => {
        if (!cancelled) setCharacters(items);
      },
      (err) => {
        if (!cancelled) setError(err.message);
      }
    );

    const unsubRumors = subscribeRumorSubmissions(
      (items) => {
        if (!cancelled) setRumors(items);
      },
      (err) => {
        if (!cancelled) setError(err.message);
      }
    );

    return () => {
      cancelled = true;
      unsubChars();
      unsubRumors();
    };
  }, [isActive, isAuthorized, refreshCountsFor]);

  const signIn = useCallback(async () => {
    setError(null);
    setLastSyncSummary(null);
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      setUser(result.user);
      if (!isAuthorizedOrganizer(result.user)) {
        clearCachedAccessToken();
        setHasToken(false);
        return;
      }
      setHasToken(true);
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
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    setLastSyncSummary(null);
    await logout();
    setUser(null);
    setHasToken(false);
    setSpreadsheet(null);
    setSheetCounts(null);
    setCharacters([]);
    setRumors([]);
  }, []);

  const disconnectSpreadsheet = useCallback(async () => {
    setError(null);
    setIsBusy(true);
    try {
      await deleteOrganizerSheetConfig();
      setSpreadsheet(null);
      setSheetCounts(null);
      setLastSyncSummary(null);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsBusy(false);
    }
  }, [handleAuthError]);

  const refreshCounts = useCallback(async () => {
    const token = getAccessToken();
    if (!token || !spreadsheet?.spreadsheetId) return;
    await refreshCountsFor(token, spreadsheet.spreadsheetId);
  }, [spreadsheet?.spreadsheetId, refreshCountsFor]);

  const requestCreateSpreadsheet = useCallback(() => {
    setError(null);
    const token = getAccessToken();
    if (!token || !isAuthorized) {
      setError('Inicia sesión con tu cuenta de organización para crear tu hoja privada.');
      return;
    }

    setPendingAction({
      request: {
        title: '¿Crear tu Google Sheet privado?',
        description:
          'Se creará una hoja de cálculo privada en tu cuenta de Google con pestañas separadas para Personajes y Rumores de Lady Nebula. Ningún invitado podrá verla.',
        confirmLabel: 'Confirmar y crear hoja',
        details: [
          { label: 'Nombre del documento', value: DEFAULT_SPREADSHEET_TITLE },
          {
            label: 'Pestañas incluidas',
            value: `${CHARACTERS_SHEET_TITLE} · ${RUMORS_SHEET_TITLE}`,
          },
          { label: 'Privacidad', value: `Solo accesible por ${ORGANIZER_EMAIL}` },
        ],
      },
      execute: async () => {
        const freshToken = getAccessToken();
        if (!freshToken) throw new SheetsAuthExpiredError();
        const created = await createOrbitaSpreadsheet(freshToken, DEFAULT_SPREADSHEET_TITLE);
        await saveOrganizerSheetConfig(created.spreadsheetId, created.title, user?.email || ORGANIZER_EMAIL);
        setSpreadsheet(created);
        setSheetCounts({ charactersCount: 0, rumorsCount: 0 });
      },
    });
  }, [isAuthorized, user?.email]);

  const connectExistingSpreadsheet = useCallback(
    async (urlOrId: string) => {
      setError(null);
      const token = getAccessToken();
      if (!token || !isAuthorized) {
        setError('Inicia sesión con tu cuenta de organización primero.');
        return;
      }

      const spreadsheetId = extractSpreadsheetId(urlOrId);
      if (!spreadsheetId) {
        setError('Pega un enlace válido de Google Sheets o el ID de tu hoja.');
        return;
      }

      setIsBusy(true);
      try {
        const metadata = await inspectSpreadsheet(token, spreadsheetId);
        const missingTabs = findMissingSheetTitles(metadata.sheetTitles);

        if (missingTabs.length === 0) {
          await saveOrganizerSheetConfig(
            metadata.spreadsheetId,
            metadata.title,
            user?.email || ORGANIZER_EMAIL
          );
          setSpreadsheet(metadata);
          await refreshCountsFor(token, metadata.spreadsheetId);
          return;
        }

        setPendingAction({
          request: {
            title: `¿Preparar "${metadata.title}"?`,
            description:
              'Esta hoja aún no tiene las pestañas de Órbita-X. Si confirmas, añadiremos las pestañas necesarias sin borrar tus datos actuales.',
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
            await saveOrganizerSheetConfig(
              prepared.spreadsheetId,
              prepared.title,
              user?.email || ORGANIZER_EMAIL
            );
            setSpreadsheet(prepared);
            await refreshCountsFor(freshToken, prepared.spreadsheetId);
          },
        });
      } catch (err) {
        handleAuthError(err);
      } finally {
        setIsBusy(false);
      }
    },
    [isAuthorized, user?.email, handleAuthError, refreshCountsFor]
  );

  const requestSyncPendingToSheets = useCallback(() => {
    setError(null);
    setLastSyncSummary(null);

    const token = getAccessToken();
    if (!token || !isAuthorized) {
      setError('Inicia sesión con tu cuenta de organización para sincronizar.');
      return;
    }

    if (!spreadsheet?.spreadsheetId) {
      setError('Crea o conecta primero tu Google Sheet privado.');
      return;
    }

    const charsToSync = [...pendingCharacters].reverse();
    const rumorsToSync = [...pendingRumors].reverse();
    const total = charsToSync.length + rumorsToSync.length;

    if (total === 0) {
      setLastSyncSummary('Todas las respuestas ya están sincronizadas en tu Google Sheet.');
      return;
    }

    const targetSheet = spreadsheet;
    setPendingAction({
      request: {
        title: `¿Sincronizar ${total} ${total === 1 ? 'respuesta nueva' : 'respuestas nuevas'}?`,
        description:
          'Se añadirán las filas pendientes a tu Google Sheet privado y se marcarán como sincronizadas para evitar duplicados.',
        confirmLabel: 'Confirmar y sincronizar',
        details: [
          { label: 'Hoja privada', value: targetSheet.title },
          { label: 'Personajes nuevos', value: String(charsToSync.length) },
          { label: 'Rumores nuevos', value: String(rumorsToSync.length) },
          { label: 'Correos automáticos', value: 'Desactivados' },
        ],
      },
      execute: async () => {
        const freshToken = getAccessToken();
        if (!freshToken) throw new SheetsAuthExpiredError();

        await ensureOrbitaTabs(freshToken, targetSheet.spreadsheetId);

        if (charsToSync.length > 0) {
          const charRows = charsToSync.map((item) =>
            buildCharacterSheetRow(
              {
                nombre: item.nombre,
                email: item.email,
                perfil: item.perfil,
                mania: item.mania,
                lema: item.lema,
              },
              formatSheetTimestamp(item.createdAt ?? new Date())
            )
          );
          await appendRowsToSheet(
            freshToken,
            targetSheet.spreadsheetId,
            CHARACTERS_SHEET_TITLE,
            charRows
          );
          await Promise.all(charsToSync.map((item) => markCharacterSynced(item.id)));
        }

        if (rumorsToSync.length > 0) {
          const rumorRows = rumorsToSync.map((item) =>
            buildRumorSheetRow(
              {
                objetivo: item.objetivo,
                autor: item.autor,
                anonymous: item.anonymous,
                mania: item.mania,
                soborno: item.soborno,
                chisme: item.chisme,
              },
              formatSheetTimestamp(item.createdAt ?? new Date())
            )
          );
          await appendRowsToSheet(
            freshToken,
            targetSheet.spreadsheetId,
            RUMORS_SHEET_TITLE,
            rumorRows
          );
          await Promise.all(rumorsToSync.map((item) => markRumorSynced(item.id)));
        }

        await refreshCountsFor(freshToken, targetSheet.spreadsheetId);
        setLastSyncSummary(
          `Sincronizadas ${charsToSync.length} fichas de personaje y ${rumorsToSync.length} rumores en "${targetSheet.title}".`
        );
      },
    });
  }, [isAuthorized, spreadsheet, pendingCharacters, pendingRumors, refreshCountsFor]);

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
    isSignedIn,
    isAuthorized,
    accessDenied,
    isLoggingIn,
    isLoadingData,
    spreadsheet,
    sheetCounts,
    isRefreshingCounts,
    characters,
    rumors,
    pendingCharactersCount: pendingCharacters.length,
    pendingRumorsCount: pendingRumors.length,
    totalPendingCount: pendingCharacters.length + pendingRumors.length,
    isBusy,
    error,
    lastSyncSummary,
    pendingConfirmation: pendingAction?.request ?? null,
    clearError: () => setError(null),
    signIn,
    signOut,
    disconnectSpreadsheet,
    refreshCounts,
    requestCreateSpreadsheet,
    connectExistingSpreadsheet,
    requestSyncPendingToSheets,
    confirmPendingAction,
    cancelPendingAction,
  };
}
