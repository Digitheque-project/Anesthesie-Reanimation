// Sons de notification synthétisés (Web Audio API) — pas de fichier audio externe requis.
// Un carillon doux à deux notes pour une prescription normale, un signal plus insistant
// (trois bips ascendants) pour les prescriptions urgentes/STAT.

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioCtx) audioCtx = new AudioCtx();
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

function tone(ctx: AudioContext, freq: number, startAt: number, duration: number, opts?: { type?: OscillatorType; peakGain?: number }) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = opts?.type || 'sine';
  osc.frequency.value = freq;

  const peak = opts?.peakGain ?? 0.25;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(peak, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

// Carillon doux (deux notes descendantes) pour une prescription normale.
export function jouerSonPrescription() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    tone(ctx, 1046.5, now, 0.35, { peakGain: 0.22 }); // Do6
    tone(ctx, 783.99, now + 0.16, 0.4, { peakGain: 0.22 }); // Sol5
  } catch {
    // lecture audio indisponible (politique navigateur) — on ignore silencieusement
  }
}

// Signal plus marqué (trois bips ascendants) pour une prescription urgente/STAT.
export function jouerSonPrescriptionUrgente() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    tone(ctx, 880, now, 0.15, { type: 'triangle', peakGain: 0.28 });
    tone(ctx, 1046.5, now + 0.18, 0.15, { type: 'triangle', peakGain: 0.28 });
    tone(ctx, 1318.5, now + 0.36, 0.25, { type: 'triangle', peakGain: 0.3 });
  } catch {
    // lecture audio indisponible — on ignore silencieusement
  }
}

// Bip unique pour l'alarme de surveillance pendant l'opération.
export function jouerBipAlarme() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    tone(ctx, 960, ctx.currentTime, 0.22, { type: 'square', peakGain: 0.3 });
  } catch {
    // lecture audio indisponible — on ignore silencieusement
  }
}

// Déclenche un bip immédiat puis répète toutes les `intervalleMs` — utilisé pendant l'alerte
// de surveillance, tant qu'elle n'est pas acquittée. Retourne une fonction pour arrêter.
export function demarrerAlarmeRepetee(intervalleMs = 2000): () => void {
  jouerBipAlarme();
  const id = setInterval(jouerBipAlarme, intervalleMs);
  return () => clearInterval(id);
}
