import { useCallback, useEffect, useState } from 'react';
import { Navbar, type ActiveView } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StorySection } from './components/StorySection';
import { BriefingBento } from './components/BriefingBento';
import { DressCodeSection } from './components/DressCodeSection';
import { CharacterFormSection } from './components/CharacterFormSection';
import { RumorMailboxView } from './components/RumorMailboxView';
import { OrganizerPanelView } from './components/OrganizerPanelView';
import { SheetsConfirmModal } from './components/SheetsConfirmModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { useOrganizerSheets } from './hooks/useOrganizerSheets';

const MAIN_SECTIONS = ['top', 'cronica', 'detalles', 'dresscode', 'personaje'] as const;

function getInitialView(): ActiveView {
  if (typeof window === 'undefined') return 'main';
  const params = new URLSearchParams(window.location.search);
  if (params.get('organizacion') === '1' || window.location.hash === '#organizacion') {
    return 'organizer';
  }
  return 'main';
}

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>(getInitialView);
  const [activeSection, setActiveSection] = useState<string>('top');
  const [registeredGuestName, setRegisteredGuestName] = useState<string>('');
  const organizer = useOrganizerSheets(activeView === 'organizer');

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

  const handleNavigateOrganizer = useCallback(() => {
    setActiveView('organizer');
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
    <ErrorBoundary>
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
                completedGuestName={registeredGuestName}
                onStartCharacter={() => handleNavigateMain('personaje')}
                onOpenRumors={() => handleNavigateRumors()}
              />
              <StorySection />
              <BriefingBento
                completedGuestName={registeredGuestName}
                onStartCharacter={() => handleNavigateMain('personaje')}
                onOpenRumors={() => handleNavigateRumors()}
              />
              <DressCodeSection />
              <CharacterFormSection
                onRegistered={(name) => setRegisteredGuestName(name)}
                onOpenRumors={(author) => handleNavigateRumors(author)}
              />
            </div>
          ) : activeView === 'rumors' ? (
            <div key="view-rumors" className="animate-fade-up">
              <RumorMailboxView
                initialAuthor={registeredGuestName}
                onBackToInvitation={() => handleNavigateMain('top')}
                onGoToCreateCharacter={() => handleNavigateMain('personaje')}
              />
            </div>
          ) : (
            <div key="view-organizer" className="animate-fade-up">
              <OrganizerPanelView
                organizer={organizer}
                onBackToInvitation={() => handleNavigateMain('top')}
              />
            </div>
          )}
        </main>

        <Footer
          onNavigateMain={handleNavigateMain}
          onNavigateRumors={() => handleNavigateRumors()}
          onNavigateOrganizer={handleNavigateOrganizer}
        />

        <SheetsConfirmModal
          request={organizer.pendingConfirmation}
          isBusy={organizer.isBusy}
          onConfirm={() => void organizer.confirmPendingAction()}
          onCancel={organizer.cancelPendingAction}
        />
      </div>
    </ErrorBoundary>
  );
}
