export interface AudioControlState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number; // 0 to 1
  lastNonZeroVolume: number; // 0.05 to 1
}

export const DEFAULT_VOLUME = 0.45;
export const MAX_AMBIENT_GAIN = 0.14;

export const INITIAL_AUDIO_STATE: AudioControlState = {
  isPlaying: false,
  isMuted: true,
  volume: DEFAULT_VOLUME,
  lastNonZeroVolume: DEFAULT_VOLUME,
};

export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_VOLUME;
  return Math.min(1, Math.max(0, Math.round(value * 100) / 100));
}

/**
 * Perceptual quadratic volume curve capped at MAX_AMBIENT_GAIN so the
 * 3027 gala soundscape always stays subtle and atmospheric.
 */
export function volumeToGain(volume: number, isMuted: boolean): number {
  if (isMuted) return 0;
  const clamped = clampVolume(volume);
  if (clamped <= 0) return 0;
  return Number((clamped * clamped * MAX_AMBIENT_GAIN).toFixed(5));
}

export function toggleMuteState(state: AudioControlState): AudioControlState {
  const shouldUnmute = state.isMuted || !state.isPlaying || state.volume <= 0;
  if (shouldUnmute) {
    const restored =
      state.volume > 0 ? clampVolume(state.volume) : clampVolume(state.lastNonZeroVolume || DEFAULT_VOLUME);
    return {
      isPlaying: true,
      isMuted: false,
      volume: restored > 0 ? restored : DEFAULT_VOLUME,
      lastNonZeroVolume: restored > 0 ? restored : DEFAULT_VOLUME,
    };
  }

  return {
    ...state,
    isPlaying: true,
    isMuted: true,
    lastNonZeroVolume: state.volume > 0 ? clampVolume(state.volume) : state.lastNonZeroVolume,
  };
}

export function setVolumeState(state: AudioControlState, nextVolume: number): AudioControlState {
  const clamped = clampVolume(nextVolume);
  if (clamped <= 0) {
    return {
      ...state,
      isPlaying: true,
      isMuted: true,
      volume: 0,
    };
  }

  return {
    isPlaying: true,
    isMuted: false,
    volume: clamped,
    lastNonZeroVolume: clamped,
  };
}

export function getVolumePercent(state: AudioControlState): number {
  if (state.isMuted || !state.isPlaying) return 0;
  return Math.round(clampVolume(state.volume) * 100);
}

export function getAudioButtonAriaLabel(state: AudioControlState): string {
  if (state.isMuted || !state.isPlaying || state.volume <= 0) {
    return 'Activar sonido ambiental de la gala';
  }
  return `Sonido ambiental activo (${getVolumePercent(state)}%). Abrir control de volumen`;
}
