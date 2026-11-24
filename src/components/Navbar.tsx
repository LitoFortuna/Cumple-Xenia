import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { EVENT_CONFIG } from '../data/eventData';
import { AmbientSoundControl } from './AmbientSoundControl';

export type ActiveView = 'main' | 'rumors';

interface NavbarProps {
  activeView: ActiveView;
  activeSection: string;
  onNavigateMain: (sectionId?: string) => void;
  onNavigateRumors: () => void;
}

export function Navbar({
  activeView,
  activeSection,
  onNavigateMain,
  onNavigateRumors,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const handleNavMain = (sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigateMain(sectionId);
  };

  const handleNavRumors = () => {
    setMobileMenuOpen(false);
    onNavigateRumors();
  };

  const linkClass = (isActive: boolean) =>
    `relative py-1 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] rounded-sm ${
      isActive ? 'text-white' : 'text-[#9ca3af] hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#06070b]/82 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Clean single-line brand wordmark */}
        <button
          type="button"
          onClick={() => handleNavMain('top')}
          className="font-display text-lg font-semibold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] rounded-sm"
        >
          {EVENT_CONFIG.brandName}
        </button>

        {/* Zone 2: Desktop primary navigation */}
        <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-7">
          <button
            type="button"
            onClick={() => handleNavMain('cronica')}
            className={linkClass(activeView === 'main' && activeSection === 'cronica')}
          >
            Historia
          </button>
          <button
            type="button"
            onClick={() => handleNavMain('detalles')}
            className={linkClass(activeView === 'main' && activeSection === 'detalles')}
          >
            Detalles
          </button>
          <button
            type="button"
            onClick={() => handleNavMain('dresscode')}
            className={linkClass(activeView === 'main' && activeSection === 'dresscode')}
          >
            Dress Code
          </button>
          <button
            type="button"
            onClick={handleNavRumors}
            className={linkClass(activeView === 'rumors')}
          >
            Buzón Lady Nebula
          </button>
        </nav>

        {/* Zone 3: Ambient sound toggle, primary CTA, and mobile menu trigger */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <AmbientSoundControl />

          <button
            type="button"
            onClick={() => handleNavMain('personaje')}
            className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#2563eb] px-4 py-2 text-xs sm:text-sm font-medium text-white whitespace-nowrap shrink-0 transition-all duration-150 hover:bg-[#1d4ed8] active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06070b]"
          >
            Crear ficha
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            className="inline-flex md:hidden h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#e5e7eb] transition-colors hover:bg-white/[0.08] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation-drawer"
          aria-label="Navegación móvil"
          className="md:hidden border-t border-white/[0.08] bg-[#0b0d14]/98 backdrop-blur-2xl animate-fade-up"
        >
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
              <button
                type="button"
                onClick={() => handleNavMain('top')}
                className={`flex min-h-[44px] w-full items-center justify-between rounded-xl px-4 text-left text-base font-medium transition-colors cursor-pointer ${
                  activeView === 'main' && activeSection === 'top'
                    ? 'bg-white/[0.08] text-white'
                    : 'text-[#d1d5db] hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <span>Invitación</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavMain('cronica')}
                className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-4 text-left text-base font-medium text-[#d1d5db] transition-colors hover:bg-white/[0.05] hover:text-white cursor-pointer"
              >
                <span>Historia</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavMain('detalles')}
                className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-4 text-left text-base font-medium text-[#d1d5db] transition-colors hover:bg-white/[0.05] hover:text-white cursor-pointer"
              >
                <span>Detalles</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavMain('dresscode')}
                className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-4 text-left text-base font-medium text-[#d1d5db] transition-colors hover:bg-white/[0.05] hover:text-white cursor-pointer"
              >
                <span>Dress Code</span>
              </button>
              <button
                type="button"
                onClick={handleNavRumors}
                className={`flex min-h-[44px] w-full items-center justify-between rounded-xl px-4 text-left text-base font-medium transition-colors cursor-pointer ${
                  activeView === 'rumors'
                    ? 'bg-[#7c3aed]/20 text-white'
                    : 'text-[#c4b5fd] hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <span>Buzón Lady Nebula</span>
              </button>
            </div>
        </nav>
      )}
    </header>
  );
}
