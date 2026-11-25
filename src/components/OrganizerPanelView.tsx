import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ExternalLink,
  Link2,
  Loader2,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  ShieldAlert,
  Table2,
} from 'lucide-react';
import type { OrganizerSheetsController } from '../hooks/useOrganizerSheets';
import { buildSpreadsheetUrl, formatSheetTimestamp } from '../utils/sheetsLogic';
import { GoogleSignInButton } from './GoogleSignInButton';

interface OrganizerPanelViewProps {
  organizer: OrganizerSheetsController;
  onBackToInvitation: () => void;
}

type ActiveTab = 'characters' | 'rumors';

export function OrganizerPanelView({
  organizer,
  onBackToInvitation,
}: OrganizerPanelViewProps) {
  const [sheetUrlInput, setSheetUrlInput] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('characters');

  const handleConnectSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await organizer.connectExistingSpreadsheet(sheetUrlInput);
    setSheetUrlInput('');
    setShowLinkInput(false);
  };

  return (
    <section className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToInvitation}
            className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-[#9ca3af] transition-colors hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] rounded-sm"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Volver a la invitación</span>
          </button>

          {organizer.user && (
            <button
              type="button"
              onClick={() => void organizer.signOut()}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-[#9ca3af] transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Cerrar sesión</span>
            </button>
          )}
        </div>

        {/* Locked State: Unauthenticated */}
        {!organizer.isAuthorized && !organizer.accessDenied && (
          <div className="mx-auto max-w-xl rounded-3xl border border-white/[0.08] bg-[#0e1017] p-8 sm:p-10 text-center space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.04] text-[#93c5fd]">
              <Lock className="h-6 w-6" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-wide text-[#60a5fa]">
                Acceso privado · Solo organización
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#f9fafb]">
                Panel de Órbita-X
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-[#9ca3af]">
                Inicia sesión con tu cuenta de Google autorizada para consultar las respuestas
                recibidas y sincronizarlas con tu Google Sheet privado.
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <GoogleSignInButton
                onClick={() => void organizer.signIn()}
                isLoading={organizer.isLoggingIn}
              />
            </div>

            {organizer.error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-2xl border border-rose-500/35 bg-rose-950/40 p-4 text-left text-xs sm:text-sm text-rose-200"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                <span>{organizer.error}</span>
              </div>
            )}
          </div>
        )}

        {/* Access Denied State: Signed in with a non-organizer Google account */}
        {organizer.accessDenied && (
          <div className="mx-auto max-w-xl rounded-3xl border border-rose-500/30 bg-[#0e1017] p-8 sm:p-10 text-center space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-950/40 text-rose-300">
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-semibold text-[#f9fafb]">
                Acceso restringido
              </h1>
              <p className="text-sm leading-relaxed text-[#9ca3af]">
                La cuenta <span className="text-[#f3f4f6]">{organizer.user?.email}</span> no tiene
                permisos de organización. Las respuestas y la hoja de cálculo son estrictamente
                privadas.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => void organizer.signOut()}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.05] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.1] cursor-pointer"
              >
                Cambiar de cuenta
              </button>
              <button
                type="button"
                onClick={onBackToInvitation}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#2563eb] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8] cursor-pointer"
              >
                Volver a la invitación
              </button>
            </div>
          </div>
        )}

        {/* Authorized Organizer Dashboard */}
        {organizer.isAuthorized && (
          <div className="space-y-6 animate-fade-up">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#60a5fa]">
                Organización · {organizer.user?.email}
              </p>
              <h1 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight text-[#f9fafb]">
                Respuestas privadas y Google Sheets
              </h1>
              <p className="text-sm sm:text-base text-[#9ca3af]">
                Los invitados envían sus formularios sin ver esta sección ni tu hoja de cálculo.
                Sincroniza aquí las respuestas nuevas con tu Google Sheet personal cuando quieras.
              </p>
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/[0.08] bg-[#0e1017] p-5">
                <p className="text-xs font-medium text-[#9ca3af]">Personajes recibidos</p>
                <p className="mt-1 font-display text-3xl font-semibold text-white tabular-nums">
                  {organizer.characters.length}
                </p>
                <p className="mt-1 text-xs text-[#6b7280]">
                  {organizer.pendingCharactersCount} pendientes de pasar al Sheet
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-[#0e1017] p-5">
                <p className="text-xs font-medium text-[#9ca3af]">Rumores Lady Nebula</p>
                <p className="mt-1 font-display text-3xl font-semibold text-white tabular-nums">
                  {organizer.rumors.length}
                </p>
                <p className="mt-1 text-xs text-[#6b7280]">
                  {organizer.pendingRumorsCount} pendientes de pasar al Sheet
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-[#0e1017] p-5">
                <p className="text-xs font-medium text-[#9ca3af]">Pendientes de sincronizar</p>
                <p className="mt-1 font-display text-3xl font-semibold text-[#60a5fa] tabular-nums">
                  {organizer.totalPendingCount}
                </p>
                <p className="mt-1 text-xs text-[#6b7280]">
                  {organizer.totalPendingCount === 0
                    ? 'Todo al día en tu hoja privada'
                    : 'Listas para añadir a tu Google Sheet'}
                </p>
              </div>
            </div>

            {/* Private Google Sheet Connection & Batch Sync Card */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#0e1017] p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-[#93c5fd]">
                    <Table2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#93c5fd]">Tu Google Sheet privado</p>
                    <p className="text-base font-semibold text-[#f9fafb]">
                      {organizer.spreadsheet
                        ? organizer.spreadsheet.title
                        : 'Aún no has vinculado ninguna hoja'}
                    </p>
                  </div>
                </div>

                {organizer.spreadsheet && (
                  <button
                    type="button"
                    onClick={organizer.requestSyncPendingToSheets}
                    disabled={organizer.isBusy || organizer.totalPendingCount === 0}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-[#2563eb] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                  >
                    {organizer.isBusy ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span>
                      {organizer.totalPendingCount > 0
                        ? `Sincronizar ${organizer.totalPendingCount} pendientes al Sheet`
                        : 'Todo sincronizado'}
                    </span>
                  </button>
                )}
              </div>

              {!organizer.spreadsheet ? (
                <div className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <button
                      type="button"
                      onClick={organizer.requestCreateSpreadsheet}
                      disabled={organizer.isBusy}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-60 cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>Crear mi Google Sheet privado</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowLinkInput((prev) => !prev)}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-[#e5e7eb] transition-colors hover:bg-white/[0.08] cursor-pointer whitespace-nowrap"
                    >
                      <Link2 className="h-4 w-4" aria-hidden="true" />
                      <span>Usar una hoja mía existente</span>
                    </button>
                  </div>

                  {showLinkInput && (
                    <form
                      onSubmit={(e) => void handleConnectSubmit(e)}
                      className="flex flex-col sm:flex-row gap-2.5 pt-1"
                    >
                      <label htmlFor="organizer-sheet-url" className="sr-only">
                        Enlace o ID de tu Google Sheet
                      </label>
                      <input
                        id="organizer-sheet-url"
                        type="text"
                        value={sheetUrlInput}
                        onChange={(e) => setSheetUrlInput(e.target.value)}
                        placeholder="Pega la URL de tu Google Sheet privado o su ID…"
                        className="flex-1 min-h-[44px] rounded-xl border border-white/[0.12] bg-white/[0.04] px-3.5 py-2 text-sm text-[#f3f4f6] placeholder-[#6b7280] focus:border-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/25"
                      />
                      <button
                        type="submit"
                        disabled={organizer.isBusy || !sheetUrlInput.trim()}
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-5 py-2 text-sm font-medium text-[#06070b] transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                      >
                        {organizer.isBusy ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <span>Conectar</span>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-white/[0.08] pt-4 text-xs sm:text-sm text-[#9ca3af]">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums">
                    <span>
                      Filas en Sheet · Personajes:{' '}
                      <strong className="text-[#f3f4f6]">
                        {organizer.sheetCounts ? organizer.sheetCounts.charactersCount : '—'}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Rumores:{' '}
                      <strong className="text-[#f3f4f6]">
                        {organizer.sheetCounts ? organizer.sheetCounts.rumorsCount : '—'}
                      </strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => void organizer.refreshCounts()}
                      disabled={organizer.isRefreshingCounts}
                      className="inline-flex items-center gap-1.5 font-medium text-[#9ca3af] transition-colors hover:text-white cursor-pointer"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${organizer.isRefreshingCounts ? 'animate-spin' : ''}`}
                        aria-hidden="true"
                      />
                      <span>Actualizar</span>
                    </button>

                    <a
                      href={buildSpreadsheetUrl(organizer.spreadsheet.spreadsheetId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-[#93c5fd] transition-colors hover:text-white"
                    >
                      <span>Abrir mi hoja</span>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>

                    <button
                      type="button"
                      onClick={() => void organizer.disconnectSpreadsheet()}
                      disabled={organizer.isBusy}
                      className="font-medium text-[#9ca3af] transition-colors hover:text-white cursor-pointer"
                    >
                      Cambiar hoja
                    </button>
                  </div>
                </div>
              )}

              {organizer.lastSyncSummary && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/35 p-3.5 text-xs sm:text-sm text-emerald-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                  <span>{organizer.lastSyncSummary}</span>
                </div>
              )}

              {organizer.error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-2xl border border-rose-500/35 bg-rose-950/40 p-3.5 text-xs sm:text-sm text-rose-200"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                  <span>{organizer.error}</span>
                </div>
              )}
            </div>

            {/* Tabbed Private Preview of Submissions */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#0e1017] p-6 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div role="tablist" aria-label="Tipo de respuestas" className="flex items-center gap-2">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'characters'}
                    onClick={() => setActiveTab('characters')}
                    className={`min-h-[40px] rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                      activeTab === 'characters'
                        ? 'bg-[#2563eb] text-white'
                        : 'text-[#9ca3af] hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    Personajes ({organizer.characters.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'rumors'}
                    onClick={() => setActiveTab('rumors')}
                    className={`min-h-[40px] rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                      activeTab === 'rumors'
                        ? 'bg-[#7c3aed] text-white'
                        : 'text-[#9ca3af] hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    Rumores ({organizer.rumors.length})
                  </button>
                </div>
              </div>

              {organizer.isLoadingData ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#9ca3af]">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Cargando respuestas confidenciales…</span>
                </div>
              ) : activeTab === 'characters' ? (
                organizer.characters.length === 0 ? (
                  <p className="py-10 text-center text-sm text-[#6b7280]">
                    Todavía no se ha registrado ningún personaje.
                  </p>
                ) : (
                  <div className="divide-y divide-white/[0.07]">
                    {organizer.characters.map((entry) => (
                      <article key={entry.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="text-base font-semibold text-[#f9fafb]">
                              {entry.nombre}{' '}
                              <span className="text-xs font-normal text-[#93c5fd]">
                                · {entry.perfil}
                              </span>
                            </h3>
                            <p className="text-xs text-[#9ca3af]">
                              {entry.email}
                              {entry.createdAt
                                ? ` · ${formatSheetTimestamp(entry.createdAt)}`
                                : ''}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              entry.syncedToSheets ? 'text-emerald-400' : 'text-amber-300'
                            }`}
                          >
                            {entry.syncedToSheets && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                            <span>{entry.syncedToSheets ? 'En Sheet' : 'Pendiente'}</span>
                          </span>
                        </div>
                        <p className="text-sm text-[#d1d5db]">
                          <strong className="text-[#9ca3af] font-medium">Manía:</strong> {entry.mania}
                        </p>
                        <p className="text-sm text-[#d1d5db]">
                          <strong className="text-[#9ca3af] font-medium">Himno:</strong> {entry.lema}
                        </p>
                      </article>
                    ))}
                  </div>
                )
              ) : organizer.rumors.length === 0 ? (
                <p className="py-10 text-center text-sm text-[#6b7280]">
                  Todavía no hay rumores en el Buzón de Lady Nebula.
                </p>
              ) : (
                <div className="divide-y divide-white/[0.07]">
                  {organizer.rumors.map((entry) => (
                    <article key={entry.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-base font-semibold text-[#f9fafb]">
                            Sobre {entry.objetivo}{' '}
                            <span className="text-xs font-normal text-[#c4b5fd]">
                              · Informante: {entry.autor}
                            </span>
                          </h3>
                          {entry.createdAt && (
                            <p className="text-xs text-[#9ca3af]">
                              {formatSheetTimestamp(entry.createdAt)}
                            </p>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            entry.syncedToSheets ? 'text-emerald-400' : 'text-amber-300'
                          }`}
                        >
                          {entry.syncedToSheets && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                          <span>{entry.syncedToSheets ? 'En Sheet' : 'Pendiente'}</span>
                        </span>
                      </div>
                      <p className="text-sm text-[#d1d5db]">
                        <strong className="text-[#9ca3af] font-medium">Manía / anécdota:</strong>{' '}
                        {entry.mania}
                      </p>
                      {entry.soborno && (
                        <p className="text-sm text-[#d1d5db]">
                          <strong className="text-[#9ca3af] font-medium">Soborno:</strong>{' '}
                          {entry.soborno}
                        </p>
                      )}
                      {entry.chisme && (
                        <p className="text-sm text-[#d1d5db]">
                          <strong className="text-[#9ca3af] font-medium">Rumor:</strong>{' '}
                          {entry.chisme}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
