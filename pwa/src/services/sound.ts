/**
 * Web Audio API Zen Singing Bowl Synthesizer
 * Zero-asset, zero-latency, 100% offline audio chime for timer completions.
 */

class SoundService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Plays a serene Tibetan Singing Bowl chime
   * Fundamental frequency with authentic warm harmonic overtones and exponential decay
   */
  public playZenBowl(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Master gain node with soft fade
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.3, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
      masterGain.connect(ctx.destination);

      // Frequencies for a Tibetan Singing Bowl (fundamental + natural metallic overtones)
      // 528Hz (Solfeggio frequency associated with transformation & calm)
      const harmonics = [
        { freq: 528, gainRatio: 0.6 },
        { freq: 528 * 1.51, gainRatio: 0.25 }, // ~797Hz
        { freq: 528 * 2.74, gainRatio: 0.15 }, // ~1446Hz
      ];

      harmonics.forEach(({ freq, gainRatio }) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Soft pitch bend for metallic resonance
        osc.frequency.exponentialRampToValueAtTime(freq * 0.998, now + 3.5);

        oscGain.gain.setValueAtTime(gainRatio, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 3.8);
      });
    } catch (e) {
      console.warn('Audio playback not permitted yet or failed:', e);
    }
  }

  /**
   * Gentle micro-tap feedback chime for check-offs
   */
  public playGentleTap(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Ignore user gesture restrictions
    }
  }
}

export const soundService = new SoundService();
