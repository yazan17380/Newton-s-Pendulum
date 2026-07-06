
let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function playCollisionSound(intensity = 0.5) {
  const ctx = getContext();

  if (ctx.state === 'suspended') ctx.resume();

  const clamped = Math.max(0, Math.min(1, intensity));
  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(700 + clamped * 500, now);
  oscillator.frequency.exponentialRampToValueAtTime(180, now + 0.09);

  const volume = 0.06 + clamped * 0.3;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.14);
}
