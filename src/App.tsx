import { useCallback, useEffect, useState } from 'react';
import { Navbar, type ActiveView } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StorySection } from './components/StorySection';
import { BriefingBento } from './components/BriefingBento';
import { DressCodeSection } from './components/DressCodeSection';
import { CharacterFormSection } from './components/CharacterFormSection';
import { RumorMailboxView } from './components/RumorMailboxView';
import { SheetsConfirmModal } from './components/SheetsConfirmModal';
import { Footer } from './components/Footer';
import { useGoogleSheets } from './hooks/useGoogleSheets';

const MAIN_SECTIONS = ['top', 'cronica', 'detalles', 'dresscode', 'personaje'] as const;

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('main');
  const [activeSection, setActiveSection] = useState<string>('top');
  const [registeredGuestName, setRegisteredGuestName] = useState<string>('');
  const sheets = useGoogleSheets();

  const scrollToSection = useCallback((sectionId: string) => {
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleNavigateMain = useCallback(
    (sectionId: string = 'top') => {
      setActiveSection(sectionId);
      if (activeView !== 'main') {
        setActiveView('main');
        window.setTimeout(() => {
          scrollToSection(sectionId);
        }, 60);
      } else {
        scrollToSection(sectionId);
      }
    },
    [activeView, scrollToSection]
  );

  const handleNavigateRumors = useCallback((prefillAuthor?: string) => {
    if (typeof prefillAuthor === 'string' && prefillAuthor.trim()) {
      setRegisteredGuestName(prefillAuthor.trim());
    }
    setActiveView('rumors');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (activeView !== 'main') return;

    const handleScroll = () => {
      const scrollY = window.scrollY + 140;
      let current: string = 'top';
      for (const id of MAIN_SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeView]);

  return (
    <div className="min-h-screen flex flex-col bg-[#06070b] text-[#f3f4f6]">
      <Navbar
        activeView={activeView}
        activeSection={activeSection}
        onNavigateMain={handleNavigateMain}
        onNavigateRumors={() => handleNavigateRumors()}
      />

      <main className="flex-1">
        {activeView === 'main' ? (
          <div key="view-main" className="animate-fade-up">
            <HeroSection
              onStartCharacter={() => handleNavigateMain('personaje')}
              onOpenRumors={() => handleNavigateRumors()}
            />
            <StorySection />
            <BriefingBento onOpenRumors={() => handleNavigateRumors()} />
            <DressCodeSection />
            <CharacterFormSection
              sheets={sheets}
              onRegistered={(name) => setRegisteredGuestName(name)}
              onOpenRumors={(author) => handleNavigateRumors(author)}
            />
          </div>
        ) : (
          <div key="view-rumors" className="animate-fade-up">
            <RumorMailboxView
              sheets={sheets}
              initialAuthor={registeredGuestName}
              onBackToInvitation={() => handleNavigateMain('top')}
            />
          </div>
        )}
      </main>

      <Footer
        onNavigateMain={handleNavigateMain}
        onNavigateRumors={() => handleNavigateRumors()}
      />

      <SheetsConfirmModal
        request={sheets.pendingConfirmation}
        isBusy={sheets.isBusy}
        onConfirm={() => void sheets.confirmPendingAction()}
        onCancel={sheets.cancelPendingAction}
      />
    </div>
  );
}
