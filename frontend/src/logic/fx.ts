const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function fire(opts: any = {}) {
  if (reduce || typeof document === "undefined") return;
  const count = opts.count || 80;
  const origin = opts.origin || { x: 0.5, y: 0.5 };
  const colors = opts.colors || ["#F59E0B", "#EC4899", "#A855F7", "#10B981", "#3B82F6", "#EF4444"];
  const spread = opts.spread || 70;
  const startVelocity = opts.startVelocity || 28;
  const ttl = opts.ttl || 1800;
  const gravity = opts.gravity || 0.5;

  let canvas: any = document.getElementById("__aio_confetti");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "__aio_confetti";
    canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;";
    document.body.appendChild(canvas);
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  const ox = origin.x * canvas.width;
  const oy = origin.y * canvas.height;
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.PI * (90 + (Math.random() - 0.5) * spread) / 180;
    const velocity = startVelocity * (0.6 + Math.random() * 0.6);
    particles.push({
      x: ox,
      y: oy,
      vx: Math.cos(angle) * velocity * (Math.random() < 0.5 ? -1 : 1),
      vy: -Math.sin(angle) * velocity,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.3,
      life: 0,
    });
  }
  const start = performance.now();
  function frame(t) {
    const elapsed = t - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += gravity;
      particle.vx *= 0.99;
      particle.rot += particle.vrot;
      particle.life++;
      const fade = Math.max(0, 1 - elapsed / ttl);
      if (fade > 0) alive = true;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rot);
      ctx.fillStyle = particle.color;
      ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.6);
      ctx.restore();
    }
    if (alive) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(frame);
}

let audioCtx;
function getAudioContext() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (error) {}
  }
  return audioCtx;
}

function tone(freq, dur = 0.12, type = "sine", gain = 0.06, delay = 0) {
  const context = getAudioContext();
  if (!context || context.state === "suspended") return;
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = freq;
  const start = context.currentTime + delay;
  gainNode.gain.setValueAtTime(0, start);
  gainNode.gain.linearRampToValueAtTime(gain, start + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + dur + 0.02);
}

const Sound = {
  correct() {
    if (window.AIO_MUTED) return;
    tone(800, 0.08, "triangle", 0.08);
    tone(1100, 0.12, "triangle", 0.08, 0.05);
  },
  wrong() {
    if (window.AIO_MUTED) return;
    tone(220, 0.18, "sawtooth", 0.05);
  },
  combo(n) {
    if (window.AIO_MUTED) return;
    const base = 600 + n * 80;
    tone(base, 0.08, "triangle", 0.08);
    tone(base * 1.5, 0.1, "triangle", 0.08, 0.06);
    tone(base * 2, 0.12, "triangle", 0.08, 0.12);
  },
  levelUp() {
    if (window.AIO_MUTED) return;
    tone(523, 0.1, "triangle", 0.08);
    tone(659, 0.1, "triangle", 0.08, 0.08);
    tone(784, 0.16, "triangle", 0.08, 0.16);
    tone(1047, 0.2, "triangle", 0.08, 0.26);
  },
  badge() {
    if (window.AIO_MUTED) return;
    tone(659, 0.12, "triangle", 0.08);
    tone(880, 0.14, "triangle", 0.08, 0.1);
  },
  lootboxOpen() {
    if (window.AIO_MUTED) return;
    tone(330, 0.18, "sine", 0.06);
    tone(440, 0.18, "sine", 0.06, 0.18);
    tone(660, 0.3, "triangle", 0.08, 0.36);
  },
  perfect() {
    if (window.AIO_MUTED) return;
    tone(523, 0.08, "triangle", 0.07);
    tone(659, 0.08, "triangle", 0.07, 0.07);
    tone(784, 0.08, "triangle", 0.07, 0.14);
    tone(1047, 0.18, "triangle", 0.08, 0.21);
  },
  click() {
    if (window.AIO_MUTED) return;
    tone(540, 0.04, "sine", 0.04);
  },
};

/**
 * Color-theory helper: returns a text color (dark or white) that reads clearly
 * on a given background hex. Uses relative luminance (WCAG) to pick whichever
 * gives the higher contrast - so colored buttons never show unreadable text.
 */
function readableTextOn(bg: string | undefined, fallback = "#ffffff"): string {
  const hex = String(bg || "").trim().replace("#", "");
  if (hex.length < 6) return fallback;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // Perceived luminance (weighted color theory formula)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // Mid-grey threshold: dark text on light fills, white text on dark fills
  return lum > 0.55 ? "#0B0D17" : "#ffffff";
}

const FX = { fire, Sound };

export { FX, fire, Sound, readableTextOn };

if (typeof window !== "undefined") {
  window.FX = FX;
  window.readableTextOn = readableTextOn;
}
