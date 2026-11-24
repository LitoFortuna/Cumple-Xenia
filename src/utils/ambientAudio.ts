import { volumeToGain } from './audioState';

type WebkitAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

/**
 * Subtle Web Audio API ambient synthesizer crafted for Gala Estelar 3027.
 * Produces a warm, slow-breathing celestial pad (Amaj9 orbital voicing)
 * with an occasional delicate starlight harmonic chime. No external audio files.
 */
export class GalaAmbientEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private padOscillators: OscillatorNode[] = [];
  private lfoOscillator: OscillatorNode | null = null;
  private shimmerTimer: number | null = null;
  private isStarted = false;
  private currentMuted = true;
  private currentVolume = 0.45;

  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (typeof window === 'undefined') return null;

    const AudioCtx = window.AudioContext || (window as WebkitAudioWindow).webkitAudioContext;
    if (!AudioCtx) return null;

    try {
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.connect(ctx.destination);

      // Gentle breathing low-pass filter for velvety space-lounge warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, ctx.currentTime);
      filter.Q.setValueAtTime(0.7, ctx.currentTime);
      filter.connect(master);

      // Slow LFO gently sweeps the filter cutoff between ~260Hz and ~500Hz
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.07, ctx.currentTime);
      lfoGain.gain.setValueAtTime(120, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.lfoOscillator = lfo;

      // Warm Amaj9 celestial pad voicing (softly detuned for spacious width)
      const voices: Array<{ freq: number; type: OscillatorType; gain: number; detune: number }> = [
        { freq: 110.0, type: 'sine', gain: 0.32, detune: 0 },       // A2 deep orbital floor
        { freq: 164.81, type: 'sine', gain: 0.22, detune: -3 },     // E3 fifth
        { freq: 220.0, type: 'triangle', gain: 0.14, detune: 4 },   // A3 octave warmth
        { freq: 277.18, type: 'sine', gain: 0.14, detune: -5 },     // C#4 luminous major third
        { freq: 329.63, type: 'sine', gain: 0.11, detune: 5 },      // E4 airy upper fifth
        { freq: 493.88, type: 'sine', gain: 0.06, detune: -2 },     // B4 aristocratic ninth
      ];

      const oscList: OscillatorNode[] = [];
      for (const voice of voices) {
        const osc = ctx.createOscillator();
        const voiceGain = ctx.createGain();
        osc.type = voice.type;
        osc.frequency.setValueAtTime(voice.freq, ctx.currentTime);
        osc.detune.setValueAtTime(voice.detune, ctx.currentTime);
        voiceGain.gain.setValueAtTime(voice.gain, ctx.currentTime);
        osc.connect(voiceGain);
        voiceGain.connect(filter);
        osc.start();
        oscList.push(osc);
      }

      this.ctx = ctx;
      this.masterGain = master;
      this.padOscillators = oscList;
      this.isStarted = true;
      this.scheduleShimmer();
      return ctx;
    } catch {
      return null;
    }
  }

  private scheduleShimmer(): void {
    if (typeof window === 'undefined') return;
    if (this.shimmerTimer !== null) {
      window.clearInterval(this.shimmerTimer);
    }

    const shimmerNotes = [659.25, 830.61, 987.77, 1108.73, 1318.51]; // E5, G#5, B5, C#6, E6
    let step = 0;

    this.shimmerTimer = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || this.currentMuted || this.ctx.state !== 'running') {
        return;
      }

      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const noteFilter = this.ctx.createBiquadFilter();

        const freq = shimmerNotes[step % shimmerNotes.length];
        step += 1;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        noteFilter.type = 'lowpass';
        noteFilter.frequency.setValueAtTime(1400, now);

        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.linearRampToValueAtTime(0.055, now + 0.65);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);

        osc.connect(noteFilter);
        noteFilter.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 3.5);
      } catch {
        // Ignore transient scheduling errors on suspended audio contexts
      }
    }, 4600);
  }

  public async sync(volume: number, isMuted: boolean): Promise<void> {
    this.currentVolume = volume;
    this.currentMuted = isMuted;

    const targetGain = volumeToGain(volume, isMuted);

    // Do not spin up an AudioContext until the user actually requests audible playback
    if (!this.isStarted && targetGain <= 0) {
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      if (ctx.state === 'suspended' && targetGain > 0) {
        await ctx.resume();
      }

      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.22);
    } catch {
      // Gracefully ignore autoplay or sandbox audio restrictions
    }
  }

  public destroy(): void {
    if (this.shimmerTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.shimmerTimer);
      this.shimmerTimer = null;
    }

    for (const osc of this.padOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Already stopped
      }
    }
    this.padOscillators = [];

    if (this.lfoOscillator) {
      try {
        this.lfoOscillator.stop();
        this.lfoOscillator.disconnect();
      } catch {
        // Already stopped
      }
      this.lfoOscillator = null;
    }

    if (this.ctx) {
      void this.ctx.close().catch(() => undefined);
      this.ctx = null;
    }

    this.masterGain = null;
    this.isStarted = false;
  }
}
