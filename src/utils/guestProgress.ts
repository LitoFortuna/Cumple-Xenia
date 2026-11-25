export interface GuestProgress {
  step1Completed: boolean;
  guestName: string;
  archetype: string;
  rumorTargets: string[];
  rumorCount: number;
  updatedAt: string | null;
}

export type GuestProgressStage = 'none' | 'step1-only' | 'all-done';

export const GUEST_PROGRESS_STORAGE_KEY = 'orbita_x_guest_progress_v1';

export const EMPTY_GUEST_PROGRESS: GuestProgress = {
  step1Completed: false,
  guestName: '',
  archetype: '',
  rumorTargets: [],
  rumorCount: 0,
  updatedAt: null,
};

export function parseGuestProgress(raw: string | null): GuestProgress {
  if (!raw) return EMPTY_GUEST_PROGRESS;
  try {
    const parsed = JSON.parse(raw) as Partial<GuestProgress>;
    const guestName = typeof parsed.guestName === 'string' ? parsed.guestName.trim().slice(0, 80) : '';
    const archetype = typeof parsed.archetype === 'string' ? parsed.archetype.trim().slice(0, 80) : '';
    const step1Completed = Boolean(parsed.step1Completed && guestName);
    const rumorTargets = Array.isArray(parsed.rumorTargets)
      ? Array.from(
          new Set(
            parsed.rumorTargets
              .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
              .map((item) => item.trim().slice(0, 80))
          )
        ).slice(0, 30)
      : [];
    const parsedCount =
      typeof parsed.rumorCount === 'number' && Number.isFinite(parsed.rumorCount) && parsed.rumorCount >= 0
        ? Math.floor(parsed.rumorCount)
        : rumorTargets.length;
    const rumorCount = Math.max(parsedCount, rumorTargets.length);
    const updatedAt = typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null;

    return {
      step1Completed,
      guestName,
      archetype,
      rumorTargets,
      rumorCount,
      updatedAt,
    };
  } catch {
    return EMPTY_GUEST_PROGRESS;
  }
}

export function recordStep1Completed(
  prev: GuestProgress,
  guestName: string,
  archetype: string,
  nowISO: string = new Date().toISOString()
): GuestProgress {
  const cleanName = guestName.trim().slice(0, 80);
  if (!cleanName) return prev;
  return {
    ...prev,
    step1Completed: true,
    guestName: cleanName,
    archetype: archetype.trim().slice(0, 80),
    updatedAt: nowISO,
  };
}

export function recordStep2Rumor(
  prev: GuestProgress,
  target: string,
  nowISO: string = new Date().toISOString()
): GuestProgress {
  const cleanTarget = target.trim().slice(0, 80);
  if (!cleanTarget) return prev;
  const nextTargets = prev.rumorTargets.includes(cleanTarget)
    ? prev.rumorTargets
    : [...prev.rumorTargets, cleanTarget].slice(0, 30);

  return {
    ...prev,
    rumorTargets: nextTargets,
    rumorCount: prev.rumorCount + 1,
    updatedAt: nowISO,
  };
}

export function getProgressStage(progress: GuestProgress): GuestProgressStage {
  if (progress.step1Completed && progress.rumorCount > 0) {
    return 'all-done';
  }
  if (progress.step1Completed) {
    return 'step1-only';
  }
  return 'none';
}

export function getCompletedStepsCount(progress: GuestProgress): number {
  let count = 0;
  if (progress.step1Completed) count += 1;
  if (progress.rumorCount > 0) count += 1;
  return count;
}

export function loadGuestProgress(): GuestProgress {
  if (typeof window === 'undefined') return EMPTY_GUEST_PROGRESS;
  try {
    return parseGuestProgress(window.localStorage.getItem(GUEST_PROGRESS_STORAGE_KEY));
  } catch {
    return EMPTY_GUEST_PROGRESS;
  }
}

export function saveGuestProgress(progress: GuestProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GUEST_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

export function clearGuestProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(GUEST_PROGRESS_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
