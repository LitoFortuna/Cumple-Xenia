import { useEffect } from 'react';
import { Loader2, Table2, X } from 'lucide-react';

export interface ConfirmationDetail {
  label: string;
  value: string;
}

export interface SheetsConfirmationRequest {
  title: string;
  description: string;
  confirmLabel: string;
  details: ConfirmationDetail[];
}

interface SheetsConfirmModalProps {
  request: SheetsConfirmationRequest | null;
  isBusy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SheetsConfirmModal({
  request,
  isBusy,
  onConfirm,
  onCancel,
}: SheetsConfirmModalProps) {
  useEffect(() => {
    if (!request) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isBusy) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [request, isBusy, onCancel]);

  if (!request) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isBusy) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheets-confirm-title"
        aria-describedby="sheets-confirm-desc"
        className="w-full max-w-lg rounded-3xl border border-white/[0.12] bg-[#0e1017] p-6 sm:p-7 shadow-[0_24px_64px_rgba(0,0,0,0.75)] animate-fade-up"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#3b82f6]/35 bg-[#2563eb]/15 text-[#93c5fd]">
              <Table2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#93c5fd]">Confirmación de Google Sheets</p>
              <h3
                id="sheets-confirm-title"
                className="font-display text-lg sm:text-xl font-semibold text-[#f9fafb]"
              >
                {request.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            aria-label="Cancelar y cerrar confirmación"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-[#9ca3af] transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-50 cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p
          id="sheets-confirm-desc"
          className="mt-4 text-sm leading-relaxed text-[#9ca3af]"
        >
          {request.description}
        </p>

        {request.details.length > 0 && (
          <dl className="mt-5 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4">
            {request.details.map((item) => (
              <div
                key={item.label}
                className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 py-2.5 text-xs sm:text-sm"
              >
                <dt className="font-medium text-[#9ca3af] shrink-0">{item.label}</dt>
                <dd className="text-[#f3f4f6] sm:text-right break-words">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-[#e5e7eb] transition-colors hover:bg-white/[0.08] disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#2563eb] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#1d4ed8] disabled:opacity-65 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa]"
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Guardando en Google Sheets…</span>
              </>
            ) : (
              <span>{request.confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
