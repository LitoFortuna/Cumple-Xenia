import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ExternalLink,
  Link2,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Table2,
} from 'lucide-react';
import type { GoogleSheetsController } from '../hooks/useGoogleSheets';
import { buildSpreadsheetUrl } from '../utils/sheetsLogic';
import { GoogleSignInButton } from './GoogleSignInButton';

interface SheetsConnectionPanelProps {
  sheets: GoogleSheetsController;
  accent?: 'cobalt' | 'violet';
}

export function SheetsConnectionPanel({
  sheets,
  accent = 'cobalt',
}: SheetsConnectionPanelProps) {
  const [sheetUrlInput, setSheetUrlInput] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const handleConnectSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sheets.connectExistingSpreadsheet(sheetUrlInput);
    setSheetUrlInput('');
    setShowLinkInput(false);
  };

  const accentTextClass = accent === 'violet' ? 'text-[#c4b5fd]' : 'text-[#93c5fd]';

  return (
    <div
      aria-label="Conexión con Google Sheets"
      className="mb-8 border-b border-white/[0.08] pb-6 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-[#93c5fd]">
            <Table2 className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className={`text-xs font-medium ${accentTextClass}`}>
              Almacenamiento en Google Sheets
            </p>
            <p className="text-sm text-[#d1d5db]">
              {!sheets.isSignedIn
                ? 'Conecta tu cuenta de Google para guardar los registros directamente en una hoja de cálculo, sin correos automáticos.'
                : sheets.spreadsheet
                  ? sheets.spreadsheet.title
                  : `Conectado como ${sheets.user?.email || sheets.user?.displayName || 'Google'}`}
            </p>
          </div>
        </div>

        {sheets.isSignedIn && (
          <button
            type="button"
            onClick={() => void sheets.signOut()}
            className="inline-flex min-h-[36px] self-start sm:self-center items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#9ca3af] transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer whitespace-nowrap"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Cerrar sesión</span>
          </button>
        )}
      </div>

      {!sheets.isSignedIn ? (
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <GoogleSignInButton
            onClick={() => void sheets.signIn()}
            isLoading={sheets.isLoggingIn}
          />
          {sheets.spreadsheet && (
            <p className="text-xs text-[#9ca3af]">
              Hoja vinculada previamente: <span className="text-[#e5e7eb]">{sheets.spreadsheet.title}</span>
            </p>
          )}
        </div>
      ) : !sheets.spreadsheet ? (
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={sheets.requestCreateSpreadsheet}
              disabled={sheets.isBusy}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full bg-[#2563eb] px-5 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-60 cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Crear hoja Órbita-X</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLinkInput((prev) => !prev)}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-5 py-2 text-xs sm:text-sm font-medium text-[#e5e7eb] transition-colors hover:bg-white/[0.08] cursor-pointer whitespace-nowrap"
            >
              <Link2 className="h-4 w-4" aria-hidden="true" />
              <span>Usar una hoja existente</span>
            </button>
          </div>

          {showLinkInput && (
            <form
              onSubmit={(e) => void handleConnectSubmit(e)}
              className="flex flex-col sm:flex-row gap-2.5 pt-1"
            >
              <label htmlFor="existing-sheet-url" className="sr-only">
                Enlace o ID de Google Sheets
              </label>
              <input
                id="existing-sheet-url"
                type="text"
                value={sheetUrlInput}
                onChange={(e) => setSheetUrlInput(e.target.value)}
                placeholder="Pega la URL de tu Google Sheet o su ID…"
                className="flex-1 min-h-[44px] rounded-xl border border-white/[0.12] bg-white/[0.04] px-3.5 py-2 text-xs sm:text-sm text-[#f3f4f6] placeholder-[#6b7280] focus:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/25"
              />
              <button
                type="submit"
                disabled={sheets.isBusy || !sheetUrlInput.trim()}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-medium text-[#06070b] transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {sheets.isBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <span>Conectar</span>
                )}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-white/[0.07] pt-3 text-xs text-[#9ca3af]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums">
            <span>
              Personajes:{' '}
              <strong className="text-[#f3f4f6]">
                {sheets.counts ? sheets.counts.charactersCount : '—'}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Rumores:{' '}
              <strong className="text-[#f3f4f6]">
                {sheets.counts ? sheets.counts.rumorsCount : '—'}
              </strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void sheets.refreshCounts()}
              disabled={sheets.isRefreshingCounts}
              className="inline-flex items-center gap-1.5 font-medium text-[#9ca3af] transition-colors hover:text-white cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${sheets.isRefreshingCounts ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>Actualizar</span>
            </button>

            <a
              href={buildSpreadsheetUrl(sheets.spreadsheet.spreadsheetId)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-[#93c5fd] transition-colors hover:text-white"
            >
              <span>Abrir hoja</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={sheets.disconnectSpreadsheet}
              className="font-medium text-[#9ca3af] transition-colors hover:text-white cursor-pointer"
            >
              Cambiar hoja
            </button>
          </div>
        </div>
      )}

      {sheets.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-rose-500/35 bg-rose-950/40 p-3 text-xs sm:text-sm text-rose-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
          <span>{sheets.error}</span>
        </div>
      )}
    </div>
  );
}
