import { Lock } from 'lucide-react';
import { EVENT_CONFIG } from '../data/eventData';

interface FooterProps {
  onNavigateMain: (sectionId?: string) => void;
  onNavigateRumors: () => void;
  onNavigateOrganizer: () => void;
}

export function Footer({
  onNavigateMain,
  onNavigateRumors,
  onNavigateOrganizer,
}: FooterProps) {
  return (
    <footer className="mt-12 border-t border-white/[0.08] bg-[#06070b]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs sm:text-sm text-[#6b7280]">
        <div className="space-y-1">
          <p className="font-medium text-[#d1d5db]">
            Operación {EVENT_CONFIG.brandName} · Cumpleaños de Xenia
          </p>
          <p>
            Domingo 3 de enero, 17:00h <span aria-hidden="true">·</span> Molins de Rei
          </p>
        </div>

        <nav aria-label="Navegación pie de página" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <button
            type="button"
            onClick={() => onNavigateMain('cronica')}
            className="transition-colors hover:text-[#e5e7eb] cursor-pointer"
          >
            Historia
          </button>
          <button
            type="button"
            onClick={() => onNavigateMain('detalles')}
            className="transition-colors hover:text-[#e5e7eb] cursor-pointer"
          >
            Detalles
          </button>
          <button
            type="button"
            onClick={() => onNavigateMain('dresscode')}
            className="transition-colors hover:text-[#e5e7eb] cursor-pointer"
          >
            Dress Code
          </button>
          <button
            type="button"
            onClick={() => onNavigateMain('personaje')}
            className="transition-colors hover:text-[#e5e7eb] cursor-pointer"
          >
            Crear ficha
          </button>
          <button
            type="button"
            onClick={onNavigateRumors}
            className="transition-colors hover:text-[#c4b5fd] cursor-pointer"
          >
            Buzón Lady Nebula
          </button>
          <button
            type="button"
            onClick={onNavigateOrganizer}
            aria-label="Acceso privado organización"
            className="inline-flex items-center gap-1 text-[#4b5563] transition-colors hover:text-[#9ca3af] cursor-pointer"
          >
            <Lock className="h-3 w-3" aria-hidden="true" />
            <span>Organización</span>
          </button>
        </nav>
      </div>
    </footer>
  );
}
