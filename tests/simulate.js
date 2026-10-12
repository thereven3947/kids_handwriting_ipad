// Generates fake "child" handwriting from guide strokes for tests and tuning.
const G = require("../guides.js");

function rng(seed) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/**
 * strokes: guide strokes in canvas px. unit: letter height in px.
 * opts (all in letter-height units unless noted):
 *   wobble   - amplitude of smooth hand wobble
 *   drift    - constant offset of the whole drawing
 *   scale    - size multiplier around the letter centre
 *   aspect   - extra horizontal stretch
 *   rotate   - degrees
 *   trim     - share of each stroke end left undrawn (0..0.5)
 *   reverse  - draw strokes backwards
 *   shuffle  - random stroke order
 *   stray    - add a stray mark
 *   center   - {x, y} px to move the drawing's centre to (free writing)
 */
function scribble(strokes, unit, opts = {}, seed = 1) {
  const rand = rng(seed);
  const b = G.boundsOf(strokes.flat());
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  const target = opts.center || { x: cx, y: cy };
  const scale = opts.scale || 1;
  const aspect = opts.aspect || 1;
  const angle = ((opts.rotate || 0) * Math.PI) / 180;
  const drift = (opts.drift || 0) * unit;
  const driftAngle = rand() * Math.PI * 2;
  const wobble = (opts.wobble || 0) * unit;

  const transform = (p) => {
    const x = (p.x - cx) * scale * aspect;
    const y = (p.y - cy) * scale;
    return {
      x: target.x + x * Math.cos(angle) - y * Math.sin(angle) + Math.cos(driftAngle) * drift,
      y: target.y + x * Math.sin(angle) + y * Math.cos(angle) + Math.sin(driftAngle) * drift,
    };
  };

  let out = strokes.map((stroke) => {
    if (stroke.length === 1) {
      const p = transform(stroke[0]);
      return [p, { x: p.x + 1, y: p.y + 1 }];
    }
    let pts = G.resample(stroke, Math.max(2, unit * 0.02));
    const trim = Math.floor(pts.length * (opts.trim || 0));
    if (trim > 0 && pts.length - trim * 2 > 2) pts = pts.slice(trim, pts.length - trim);
    const phases = [rand(), rand(), rand()].map((r) => r * Math.PI * 2);
    const freqs = [1 + rand(), 2 + rand() * 2, 4 + rand() * 3];
    const length = G.pathLength(pts) || 1;
    let travelled = 0;
    return pts.map((p, i) => {
      if (i > 0) travelled += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y);
      const t = (travelled / length) * Math.max(1, length / unit);
      const nx = freqs.reduce((sum, f, k) => sum + Math.sin(t * f * Math.PI + phases[k]) / (k + 1), 0) / 1.8;
      const ny = freqs.reduce((sum, f, k) => sum + Math.cos(t * f * Math.PI + phases[(k + 1) % 3]) / (k + 1), 0) / 1.8;
      const q = transform(p);
      return { x: q.x + nx * wobble, y: q.y + ny * wobble };
    });
  });

  if (opts.reverse) out = out.map((s) => s.slice().reverse());
  if (opts.shuffle) out = out.map((s) => ({ s, k: rand() })).sort((a, z) => a.k - z.k).map((o) => o.s);
  if (opts.stray) {
    const p = transform({ x: b.maxX, y: b.minY });
    out.push([p, { x: p.x + unit * 0.12, y: p.y - unit * 0.05 }]);
  }
  return out;
}

module.exports = { scribble, rng };
