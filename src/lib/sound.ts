let ctx: AudioContext | null = null;
let ctxInitialized = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctxInitialized) return ctx;

  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) {
      ctxInitialized = true;
      return null;
    }
    ctx = new Ctor();
    ctxInitialized = true;
    return ctx;
  } catch (e) {
    // AudioContext creation failed (permission denied, security restriction, etc.)
    ctxInitialized = true;
    return null;
  }
}

export function playChime(soundEnabled: boolean, freq = 880, durationMs = 140) {
  if (!soundEnabled) return;
  const audio = getCtx();
  if (!audio) return;
  try {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.0001;
    osc.connect(gain).connect(audio.destination);
    const now = audio.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
    osc.start(now);
    osc.stop(now + durationMs / 1000 + 0.02);
  } catch {
    /* WebAudio not allowed — silent fallback */
  }
}

export const playClick = (soundEnabled: boolean) => playChime(soundEnabled, 660, 80);
export const playSuccess = (soundEnabled: boolean) => playChime(soundEnabled, 988, 180);
