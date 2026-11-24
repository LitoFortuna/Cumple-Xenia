import { useEffect, useRef, useState } from 'react';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { GalaAmbientEngine } from '../utils/ambientAudio';
import {
  INITIAL_AUDIO_STATE,
  getAudioButtonAriaLabel,
  getVolumePercent,
  setVolumeState,
  toggleMuteState,
  type AudioControlState,
} from '../utils/audioState';

export function AmbientSoundControl() {
  const [audioState, setAudioState] = useState<AudioControlState>(INITIAL_AUDIO_STATE);
  const [panelOpen, setPanelOpen] = useState(false);

  const engineRef = useRef<GalaAmbientEngine | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const engine = new GalaAmbientEngine();
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    void engineRef.current?.sync(audioState.volume, audioState.isMuted);
  }, [audioState.volume, audioState.isMuted]);

  useEffect(() => {
    if (!panelOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [panelOpen]);

  const isAudible = audioState.isPlaying && !audioState.isMuted && audioState.volume > 0;
  const volumePercent = getVolumePercent(audioState);

  const handleIconClick = () => {
    if (!panelOpen) {
      // If muted/inactive on first tap, activate the subtle gala ambiance right away and show volume controls
      if (!isAudible) {
        setAudioState((prev) => toggleMuteState(prev));
      }
      setPanelOpen(true);
    } else {
      setPanelOpen(false);
    }
  };

  const handleToggleMute = () => {
    setAudioState((prev) => toggleMuteState(prev));
  };

  const handleSliderChange = (percent: number) => {
    setAudioState((prev) => setVolumeState(prev, percent / 100));
  };

  const VolumeIcon = !isAudible ? VolumeX : audioState.volume <= 0.5 ? Volume1 : Volume2;

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={handleIconClick}
        aria-label={getAudioButtonAriaLabel(audioState)}
        aria-expanded={panelOpen}
        aria-controls="ambient-sound-panel"
        aria-haspopup="dialog"
        data-audio-state={isAudible ? 'playing' : 'muted'}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06070b] ${
          isAudible
            ? 'border-[#3b82f6]/50 bg-[#2563eb]/15 text-[#93c5fd] hover:bg-[#2563eb]/25 hover:text-white'
            : 'border-white/[0.1] bg-white/[0.04] text-[#9ca3af] hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-white'
        }`}
      >
        <VolumeIcon className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>

      {panelOpen && (
        <div
          id="ambient-sound-panel"
          role="dialog"
          aria-label="Control de sonido ambiental de la gala"
          className="fixed right-4 top-[72px] z-50 w-[min(calc(100vw-2rem),16.5rem)] sm:absolute sm:right-0 sm:top-13 sm:w-64 rounded-2xl border border-white/[0.1] bg-[#0c0e16]/96 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-2xl animate-fade-up"
        >
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="font-display text-sm font-semibold text-[#f9fafb]">
                Ambiente Estelar
              </p>
              <p className="text-xs text-[#9ca3af]">Frecuencia del Ritmo · 3027</p>
            </div>
            <span className="font-mono text-xs tabular-nums text-[#93c5fd]">
              {isAudible ? `${volumePercent}%` : 'Silencio'}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            <label htmlFor="ambient-volume-slider" className="sr-only">
              Volumen del sonido ambiental
            </label>
            <input
              id="ambient-volume-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={volumePercent}
              onChange={(event) => handleSliderChange(Number(event.target.value))}
              className="ambient-range w-full cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] text-[#6b7280] tabular-nums">
              <span>0%</span>
              <span>Sutil</span>
              <span>100%</span>
            </div>
          </div>

          <div className="mt-4 border-t border-white/[0.07] pt-3">
            <button
              type="button"
              onClick={handleToggleMute}
              className={`inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa] ${
                isAudible
                  ? 'border-white/[0.1] bg-white/[0.05] text-[#f3f4f6] hover:bg-white/[0.1]'
                  : 'border-[#3b82f6]/40 bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
              }`}
            >
              {isAudible ? (
                <>
                  <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Silenciar sonido</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Activar sonido</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
