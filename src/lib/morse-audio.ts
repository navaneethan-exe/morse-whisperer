// Web Audio Morse player with adjustable WPM speed.
export type MorseSpeed = "slow" | "medium" | "fast";

const WPM_MAP: Record<MorseSpeed, number> = { slow: 8, medium: 18, fast: 30 };

export class MorseAudioPlayer {
  private ctx: AudioContext | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private stopped = false;
  private onEnd?: () => void;

  constructor(private freq = 600) {}

  private ensureCtx() {
    if (!this.ctx) {
      const AC = (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private beep(start: number, duration: number) {
    const ctx = this.ensureCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = this.freq;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.25, start + 0.005);
    gain.gain.setValueAtTime(0.25, start + duration - 0.01);
    gain.gain.linearRampToValueAtTime(0, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  play(morse: string, speed: MorseSpeed, onEnd?: () => void) {
    this.stop();
    this.stopped = false;
    this.onEnd = onEnd;
    const ctx = this.ensureCtx();
    const wpm = WPM_MAP[speed];
    const dot = 1.2 / wpm; // seconds (PARIS standard)
    const dash = dot * 3;
    const symGap = dot;
    const letterGap = dot * 3;
    const wordGap = dot * 7;

    let t = ctx.currentTime + 0.05;
    const symbols = morse.replace(/\n/g, " / ").split("");
    let i = 0;
    while (i < symbols.length) {
      const ch = symbols[i];
      if (ch === ".") { this.beep(t, dot); t += dot + symGap; }
      else if (ch === "-") { this.beep(t, dash); t += dash + symGap; }
      else if (ch === " ") { t += letterGap - symGap; }
      else if (ch === "/" || ch === "|") { t += wordGap - symGap; }
      i++;
    }
    const totalMs = Math.max(50, (t - ctx.currentTime) * 1000);
    this.timer = setTimeout(() => {
      if (!this.stopped) this.onEnd?.();
    }, totalMs);
  }

  stop() {
    this.stopped = true;
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    if (this.ctx) {
      try { this.ctx.close(); } catch { /* ignore */ }
      this.ctx = null;
    }
  }
}