/*
 * Letter guide model, layout, rendering and trace evaluation.
 *
 * Glyph coordinates use handwriting-paper "em" units:
 *   y = 0    top line (capital / ascender height)
 *   y = 0.5  dashed midline (x-height)
 *   y = 1    baseline
 *   y = 1.4  descender line
 * x grows to the right; each glyph is centered horizontally when laid out.
 * Strokes are listed in teaching order (Zaner-Bloser style) and every stroke
 * runs in the direction it should be written.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.LetterGuides = api;
  }
})(typeof self !== "undefined" ? self : this, function () {
  const TOP = 0;
  const MID = 0.5;
  const BASE = 1;
  const DESC = 1.4;
  const ARC_STEP_DEGREES = 6;

  const P = (x, y) => ({ x, y });
  const same = (a, b) => Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9;

  // Small pen builder: m = move, l = line to, a = elliptical arc (degrees, screen
  // coordinates so 0 = right, 90 = down). Increasing angles turn clockwise.
  function pen(x, y) {
    const points = [];
    const push = (point) => {
      if (!points.length || !same(points[points.length - 1], point)) {
        points.push(point);
      }
    };
    if (x !== undefined) {
      push(P(x, y));
    }
    const api = {
      l(nx, ny) {
        push(P(nx, ny));
        return api;
      },
      a(cx, cy, rx, ry, startDeg, endDeg) {
        const steps = Math.max(2, Math.ceil(Math.abs(endDeg - startDeg) / ARC_STEP_DEGREES));
        for (let i = 0; i <= steps; i += 1) {
          const angle = ((startDeg + ((endDeg - startDeg) * i) / steps) * Math.PI) / 180;
          push(P(cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)));
        }
        return api;
      },
      done() {
        return points;
      },
    };
    return api;
  }

  const line = (...coords) => {
    const p = pen(coords[0], coords[1]);
    for (let i = 2; i < coords.length; i += 2) {
      p.l(coords[i], coords[i + 1]);
    }
    return p.done();
  };
  const arc = (cx, cy, rx, ry, a0, a1) => pen().a(cx, cy, rx, ry, a0, a1).done();
  const dot = (x, y) => [P(x, y)];

  // Lowercase bowl shared by a, d, g, q, o, b, p, c, e.
  const BOWL = [0.25, 0.75, 0.25, 0.25];

  const glyphs = {
    // ---------- UPPERCASE ----------
    A: [line(0.36, 0, 0, 1), line(0.36, 0, 0.72, 1), line(0.13, 0.64, 0.59, 0.64)],
    B: [
      line(0, 0, 0, 1),
      pen(0, 0).l(0.28, 0).a(0.28, 0.25, 0.24, 0.25, -90, 90).l(0, 0.5).done(),
      pen(0, 0.5).l(0.32, 0.5).a(0.32, 0.75, 0.28, 0.25, -90, 90).l(0, 1).done(),
    ],
    C: [arc(0.4, 0.5, 0.4, 0.5, -45, -315)],
    D: [line(0, 0, 0, 1), pen(0, 0).l(0.22, 0).a(0.22, 0.5, 0.42, 0.5, -90, 90).l(0, 1).done()],
    E: [line(0, 0, 0, 1), line(0, 0, 0.55, 0), line(0, 0.5, 0.45, 0.5), line(0, 1, 0.55, 1)],
    F: [line(0, 0, 0, 1), line(0, 0, 0.55, 0), line(0, 0.5, 0.45, 0.5)],
    G: [pen().a(0.42, 0.5, 0.42, 0.5, -45, -360).l(0.52, 0.5).done()],
    H: [line(0, 0, 0, 1), line(0.62, 0, 0.62, 1), line(0, 0.5, 0.62, 0.5)],
    I: [line(0.25, 0, 0.25, 1), line(0, 0, 0.5, 0), line(0, 1, 0.5, 1)],
    J: [pen(0.5, 0).l(0.5, 0.72).a(0.25, 0.72, 0.25, 0.28, 0, 165).done()],
    K: [line(0, 0, 0, 1), line(0.6, 0, 0.02, 0.55, 0.62, 1)],
    L: [line(0, 0, 0, 1, 0.52, 1)],
    M: [line(0, 0, 0, 1), line(0, 0, 0.4, 0.75, 0.8, 0, 0.8, 1)],
    N: [line(0, 0, 0, 1), line(0, 0, 0.66, 1, 0.66, 0)],
    O: [arc(0.45, 0.5, 0.45, 0.5, -90, -450)],
    P: [line(0, 0, 0, 1), pen(0, 0).l(0.3, 0).a(0.3, 0.27, 0.26, 0.27, -90, 90).l(0, 0.54).done()],
    Q: [arc(0.45, 0.5, 0.45, 0.5, -90, -450), line(0.55, 0.7, 0.9, 1)],
    R: [line(0, 0, 0, 1), pen(0, 0).l(0.3, 0).a(0.3, 0.27, 0.26, 0.27, -90, 90).l(0, 0.54).l(0.6, 1).done()],
    S: [pen().a(0.3, 0.25, 0.3, 0.25, -25, -270).a(0.3, 0.75, 0.32, 0.25, -90, 145).done()],
    T: [line(0.32, 0, 0.32, 1), line(0, 0, 0.64, 0)],
    U: [pen(0, 0).l(0, 0.68).a(0.32, 0.68, 0.32, 0.32, 180, 0).l(0.64, 0).done()],
    V: [line(0, 0, 0.35, 1, 0.7, 0)],
    W: [line(0, 0, 0.22, 1, 0.45, 0, 0.68, 1, 0.9, 0)],
    X: [line(0, 0, 0.66, 1), line(0.66, 0, 0, 1)],
    Y: [line(0, 0, 0.35, 0.5), line(0.7, 0, 0.35, 0.5, 0.35, 1)],
    Z: [line(0, 0, 0.62, 0, 0, 1, 0.62, 1)],

    // ---------- LOWERCASE ----------
    a: [arc(...BOWL, -60, -420), line(0.5, 0.5, 0.5, 1)],
    b: [line(0, 0, 0, 1), arc(...BOWL, 180, 540)],
    c: [arc(...BOWL, -40, -320)],
    d: [arc(...BOWL, -60, -420), line(0.5, 0, 0.5, 1)],
    e: [pen(0, 0.75).l(0.5, 0.75).a(...BOWL, 0, -320).done()],
    f: [pen().a(0.32, 0.16, 0.16, 0.16, -30, -180).l(0.16, 1).done(), line(0, 0.5, 0.36, 0.5)],
    g: [arc(...BOWL, -60, -420), pen(0.5, 0.5).l(0.5, 1.2).a(0.28, 1.2, 0.22, 0.2, 0, 165).done()],
    h: [line(0, 0, 0, 1), pen(0, 0.74).a(0.24, 0.74, 0.24, 0.24, 180, 360).l(0.48, 1).done()],
    i: [line(0, 0.5, 0, 1), dot(0, 0.3)],
    j: [pen(0.3, 0.5).l(0.3, 1.2).a(0.1, 1.2, 0.2, 0.2, 0, 160).done(), dot(0.3, 0.3)],
    k: [line(0, 0, 0, 1), line(0.44, 0.5, 0.02, 0.76, 0.46, 1)],
    l: [line(0, 0, 0, 1)],
    m: [
      line(0, 0.5, 0, 1),
      pen(0, 0.72).a(0.2, 0.72, 0.2, 0.22, 180, 360).l(0.4, 1).done(),
      pen(0.4, 0.72).a(0.6, 0.72, 0.2, 0.22, 180, 360).l(0.8, 1).done(),
    ],
    n: [line(0, 0.5, 0, 1), pen(0, 0.74).a(0.24, 0.74, 0.24, 0.24, 180, 360).l(0.48, 1).done()],
    o: [arc(...BOWL, -90, -450)],
    p: [line(0, 0.5, 0, 1.4), arc(...BOWL, 180, 540)],
    q: [arc(...BOWL, -60, -420), line(0.5, 0.5, 0.5, 1.4)],
    r: [line(0, 0.5, 0, 1), pen(0, 0.74).a(0.22, 0.74, 0.22, 0.24, 180, 300).done()],
    s: [pen().a(0.2, 0.625, 0.2, 0.125, -25, -270).a(0.2, 0.875, 0.22, 0.125, -90, 145).done()],
    t: [line(0.18, 0.2, 0.18, 1), line(0, 0.5, 0.36, 0.5)],
    u: [pen(0, 0.5).l(0, 0.76).a(0.24, 0.76, 0.24, 0.24, 180, 0).l(0.48, 0.5).done(), line(0.48, 0.5, 0.48, 1)],
    v: [line(0, 0.5, 0.25, 1, 0.5, 0.5)],
    w: [line(0, 0.5, 0.18, 1, 0.36, 0.6, 0.54, 1, 0.72, 0.5)],
    x: [line(0, 0.5, 0.48, 1), line(0.48, 0.5, 0, 1)],
    y: [line(0, 0.5, 0.3, 0.95), line(0.52, 0.5, 0.08, 1.4)],
    z: [line(0, 0.5, 0.46, 0.5, 0, 1, 0.46, 1)],
  };

  const STROKE_COLORS = ["#2e7d32", "#ef6c00", "#1565c0", "#8e24aa", "#c62828"];

  function getStrokeCount(letter) {
    return (glyphs[letter] || []).length;
  }

  function boundsOf(points) {
    return points.reduce(
      (b, p) => ({
        minX: Math.min(b.minX, p.x),
        minY: Math.min(b.minY, p.y),
        maxX: Math.max(b.maxX, p.x),
        maxY: Math.max(b.maxY, p.y),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );
  }

  function glyphBox(char) {
    const b = boundsOf((glyphs[char] || []).flat());
    return Number.isFinite(b.minX) ? b : { minX: 0, minY: 0, maxX: 0.5, maxY: 1 };
  }

  // Vertical space per handwriting row, in letter-height units: room for the
  // number badges above the top line, the descender area and a small margin.
  const ROW_HEADROOM = 0.32;
  const ROW_HEIGHT = ROW_HEADROOM + DESC + 0.16;
  const MAX_UNIT = 300;

  const SPACING = {
    letter: { traceGap: 0.5, writePad: 0.5, writeGap: 0.25 },
    word: { traceGap: 0.42, writePad: 0.3, writeGap: 0.08 },
  };

  /**
   * Lays out a practice sheet.
   * rows: [{ kind: "trace" | "write", chars: ["c", "a", "t"] }]
   * spacing: "letter" (separate letters) or "word" (letters of one word).
   * Every cell gets its target strokes in canvas pixels so it can be drawn and
   * judged; write cells simply do not show them.
   */
  function computeSheetLayout(width, height, rows, spacing = "letter") {
    const gaps = SPACING[spacing] || SPACING.letter;

    const rowSpecs = rows.map((row) => {
      const cells = row.chars.map((char) => {
        const box = glyphBox(char);
        const glyphWidth = box.maxX - box.minX;
        const boxWidth = row.kind === "write" ? Math.max(glyphWidth, 0.35) + gaps.writePad : glyphWidth;
        return { char, box, glyphWidth, boxWidth };
      });
      const gap = row.kind === "write" ? gaps.writeGap : gaps.traceGap;
      const widthEm = cells.reduce((sum, c) => sum + c.boxWidth, 0) + gap * Math.max(0, cells.length - 1);
      return { kind: row.kind, cells, gap, widthEm };
    });

    const margin = Math.max(12, Math.min(width, height) * 0.04);
    const widestEm = Math.max(1, ...rowSpecs.map((r) => r.widthEm)) + 0.5;
    const unit = Math.max(24, Math.min(MAX_UNIT, (width - margin * 2) / widestEm, height / (rowSpecs.length * ROW_HEIGHT)));
    const sheetTop = (height - rowSpecs.length * ROW_HEIGHT * unit) / 2;

    const layoutRows = rowSpecs.map((spec, rowIndex) => {
      const top = sheetTop + (rowIndex * ROW_HEIGHT + ROW_HEADROOM) * unit;
      const lineY = (v) => top + v * unit;
      let cursor = (width - spec.widthEm * unit) / 2;
      const cells = spec.cells.map((cellSpec, index) => {
        const x0 = cursor;
        const x1 = cursor + cellSpec.boxWidth * unit;
        cursor = x1 + spec.gap * unit;
        const glyphLeft = (x0 + x1) / 2 - (cellSpec.glyphWidth * unit) / 2;
        return {
          id: `${rowIndex}:${index}`,
          row: rowIndex,
          index,
          kind: spec.kind,
          char: cellSpec.char,
          x0,
          x1,
          strokes: (glyphs[cellSpec.char] || []).map((stroke) =>
            stroke.map((p) => ({ x: glyphLeft + (p.x - cellSpec.box.minX) * unit, y: lineY(p.y) }))
          ),
        };
      });
      return {
        kind: spec.kind,
        lines: { top: lineY(TOP), mid: lineY(MID), base: lineY(BASE), desc: lineY(DESC) },
        bandTop: top - ROW_HEADROOM * unit,
        bandBottom: top + (ROW_HEIGHT - ROW_HEADROOM) * unit,
        cells,
      };
    });

    return {
      width,
      height,
      unit,
      origin: { x: width / 2, y: sheetTop },
      rows: layoutRows,
      cells: layoutRows.flatMap((r) => r.cells),
    };
  }

  // Maps a point from one layout of the same sheet to another (e.g. after the
  // iPad rotates), so a child's ink stays on the letters it was written on.
  function remapPoint(point, fromLayout, toLayout) {
    return {
      x: toLayout.origin.x + ((point.x - fromLayout.origin.x) / fromLayout.unit) * toLayout.unit,
      y: toLayout.origin.y + ((point.y - fromLayout.origin.y) / fromLayout.unit) * toLayout.unit,
    };
  }

  function pathLength(points) {
    let total = 0;
    for (let i = 1; i < points.length; i += 1) {
      total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    }
    return total;
  }

  // Point at a given distance along a polyline, plus the local direction.
  function pointAlong(points, distance) {
    if (points.length < 2) {
      return { x: points[0].x, y: points[0].y, dx: 0, dy: 0 };
    }
    let remaining = Math.max(0, distance);
    for (let i = 1; i < points.length; i += 1) {
      const a = points[i - 1];
      const b = points[i];
      const seg = Math.hypot(b.x - a.x, b.y - a.y);
      if (seg === 0) continue;
      if (remaining <= seg || i === points.length - 1) {
        const t = Math.min(1, remaining / seg);
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, dx: (b.x - a.x) / seg, dy: (b.y - a.y) / seg };
      }
      remaining -= seg;
    }
    const last = points[points.length - 1];
    return { x: last.x, y: last.y, dx: 0, dy: 0 };
  }

  function resample(points, spacing) {
    if (points.length < 2) {
      return points.slice();
    }
    const length = pathLength(points);
    const count = Math.max(1, Math.ceil(length / spacing));
    const samples = [];
    for (let i = 0; i <= count; i += 1) {
      const p = pointAlong(points, (length * i) / count);
      samples.push({ x: p.x, y: p.y });
    }
    return samples;
  }

  function distanceToSegment(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (dx === 0 && dy === 0) {
      return Math.hypot(point.x - a.x, point.y - a.y);
    }
    const t = Math.min(1, Math.max(0, ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
  }

  function distanceToPolylines(point, polylines) {
    let nearest = Infinity;
    for (const poly of polylines) {
      if (poly.length === 1) {
        nearest = Math.min(nearest, Math.hypot(point.x - poly[0].x, point.y - poly[0].y));
        continue;
      }
      for (let i = 1; i < poly.length; i += 1) {
        nearest = Math.min(nearest, distanceToSegment(point, poly[i - 1], poly[i]));
      }
    }
    return nearest;
  }

  // ---------- Rendering ----------

  function drawArrowHead(ctx, x, y, dx, dy, size, color) {
    const angle = Math.atan2(dy, dx);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * size * 0.6, y + Math.sin(angle) * size * 0.6);
    ctx.lineTo(x + Math.cos(angle + 2.5) * size, y + Math.sin(angle + 2.5) * size);
    ctx.lineTo(x + Math.cos(angle - 2.5) * size, y + Math.sin(angle - 2.5) * size);
    ctx.closePath();
    ctx.fill();
  }

  function tracePath(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }
  }

  function drawHandwritingLines(ctx, width, lines) {
    const left = 18;
    const right = width - 18;
    const rule = (y, color, lineWidth, dash) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      ctx.restore();
    };
    rule(lines.top, "rgba(90, 150, 210, 0.45)", 2, []);
    rule(lines.mid, "rgba(90, 150, 210, 0.45)", 2, [10, 9]);
    rule(lines.base, "rgba(214, 88, 88, 0.55)", 2.5, []);
    rule(lines.desc, "rgba(90, 150, 210, 0.25)", 1.5, [4, 8]);
  }

  function drawGlyphGuide(ctx, glyph, unit, badges = []) {
    const trackWidth = Math.max(14, unit * 0.13);
    const badgeRadius = Math.max(10, unit * 0.075);
    const allSamples = glyph.strokes.flatMap((s) => resample(s, unit * 0.05));

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Track
    glyph.strokes.forEach((stroke) => {
      ctx.strokeStyle = "rgba(64, 134, 224, 0.2)";
      ctx.fillStyle = "rgba(64, 134, 224, 0.2)";
      if (stroke.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke[0].x, stroke[0].y, trackWidth * 0.6, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      ctx.lineWidth = trackWidth;
      tracePath(ctx, stroke);
      ctx.stroke();
    });

    // Direction center lines + arrows
    glyph.strokes.forEach((stroke, index) => {
      const color = STROKE_COLORS[index % STROKE_COLORS.length];
      if (stroke.length === 1) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(stroke[0].x, stroke[0].y, Math.max(4, unit * 0.025), 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      const length = pathLength(stroke);
      const headSize = Math.max(8, unit * 0.055);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.75;
      ctx.lineWidth = Math.max(2, unit * 0.012);
      ctx.setLineDash([Math.max(5, unit * 0.035), Math.max(5, unit * 0.035)]);
      tracePath(ctx, stroke);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      if (length > unit * 0.55) {
        const mid = pointAlong(stroke, length / 2);
        drawArrowHead(ctx, mid.x, mid.y, mid.dx, mid.dy, headSize * 0.85, color);
      }
      const endBack = pointAlong(stroke, Math.max(0, length - Math.min(length * 0.3, unit * 0.06)));
      const end = stroke[stroke.length - 1];
      drawArrowHead(ctx, end.x, end.y, end.x - endBack.x, end.y - endBack.y, headSize, color);
    });

    // Numbered start badges, nudged so they do not cover each other or the track,
    // preferring spots outside the letter (e.g. above an "o" rather than inside it).
    const outline = boundsOf(glyph.strokes.flat());
    const insideGlyph = (p) =>
      p.x > outline.minX + badgeRadius && p.x < outline.maxX - badgeRadius &&
      p.y > outline.minY + badgeRadius && p.y < outline.maxY - badgeRadius;
    glyph.strokes.forEach((stroke, index) => {
      const color = STROKE_COLORS[index % STROKE_COLORS.length];
      const start = stroke[0];
      let baseAngle = (-3 * Math.PI) / 4;
      if (stroke.length > 1) {
        const ahead = pointAlong(stroke, Math.min(pathLength(stroke) * 0.3, unit * 0.08));
        baseAngle = Math.atan2(start.y - ahead.y, start.x - ahead.x);
      }
      const reach = badgeRadius + trackWidth * 0.5 + 3;
      let best = null;
      [0, 0.6, -0.6, 1.2, -1.2, 1.8, -1.8, 2.4, -2.4, Math.PI].forEach((offset, order) => {
        const angle = baseAngle + offset;
        const candidate = { x: start.x + Math.cos(angle) * reach, y: start.y + Math.sin(angle) * reach };
        const hitsBadge = badges.some((b) => Math.hypot(b.x - candidate.x, b.y - candidate.y) < badgeRadius * 2 + 2);
        const trackClearance = Math.min(...allSamples.map((s) => Math.hypot(s.x - candidate.x, s.y - candidate.y)));
        const score =
          (hitsBadge ? 1000 : 0) +
          Math.max(0, badgeRadius + trackWidth * 0.35 - trackClearance) +
          (insideGlyph(candidate) ? badgeRadius : 0) +
          order * 0.01;
        if (!best || score < best.score) {
          best = { ...candidate, score };
        }
      });
      badges.push(best);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(start.x, start.y, Math.max(4, unit * 0.028), 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(best.x, best.y, badgeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.round(badgeRadius * 1.3)}px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(index + 1), best.x, best.y + 1);
    });

    ctx.restore();
  }

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawWriteCell(ctx, cell, row, unit) {
    const top = row.lines.top - unit * 0.1;
    const bottom = row.lines.desc + unit * 0.04;
    ctx.save();
    roundedRect(ctx, cell.x0, top, cell.x1 - cell.x0, bottom - top, Math.min(16, unit * 0.08));
    ctx.fillStyle = "rgba(255, 244, 196, 0.35)";
    ctx.fill();
    ctx.setLineDash([Math.max(4, unit * 0.03), Math.max(4, unit * 0.03)]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(230, 160, 40, 0.55)";
    ctx.stroke();
    ctx.setLineDash([]);

    // Small reminder of which letter goes in this box.
    ctx.fillStyle = "rgba(94, 116, 141, 0.75)";
    ctx.font = `700 ${Math.round(Math.max(12, unit * 0.15))}px "Trebuchet MS", "Segoe UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(cell.char, (cell.x0 + cell.x1) / 2, top - 3);
    ctx.restore();
  }

  function drawJudgingZone(ctx, cell, radius) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(76, 175, 80, 0.16)";
    ctx.fillStyle = "rgba(76, 175, 80, 0.16)";
    cell.strokes.forEach((stroke) => {
      if (stroke.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke[0].x, stroke[0].y, radius, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      ctx.lineWidth = radius * 2;
      tracePath(ctx, stroke);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawCellResult(ctx, cell, row, unit, result) {
    if (!result || result.state === "empty") return;
    const passed = result.state === "pass";
    const radius = Math.max(12, unit * 0.09);
    // Under the letter, where it never covers the numbered start badges.
    const x = (cell.x0 + cell.x1) / 2;
    const y = Math.min(row.lines.desc + unit * 0.02, row.bandBottom - radius);
    ctx.save();
    ctx.fillStyle = passed ? "#43a047" : "#fb8c00";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.round(radius * 1.3)}px "Segoe UI Symbol", "Arial", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(passed ? "\u2713" : "\u21BB", x, y + 1);
    ctx.restore();
  }

  /**
   * Draws the whole practice sheet.
   * options.zoneRadius  - when set, shades the judging buffer around trace tracks
   * options.results     - map of cell id -> { state: "pass" | "retry" | "empty" }
   */
  function drawSheet(ctx, layout, options = {}) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    layout.rows.forEach((row) => {
      drawHandwritingLines(ctx, layout.width, row.lines);
      const rowBadges = []; // shared so neighbouring letters' numbers do not overlap
      row.cells.forEach((cell) => {
        if (cell.kind === "write") {
          drawWriteCell(ctx, cell, row, layout.unit);
        } else {
          if (options.zoneRadius) drawJudgingZone(ctx, cell, options.zoneRadius);
          drawGlyphGuide(ctx, cell, layout.unit, rowBadges);
        }
        drawCellResult(ctx, cell, row, layout.unit, options.results && options.results[cell.id]);
      });
    });
    ctx.restore();
  }

  return {
    glyphs,
    lines: { TOP, MID, BASE, DESC },
    ROW_HEIGHT,
    STROKE_COLORS,
    getStrokeCount,
    boundsOf,
    computeSheetLayout,
    remapPoint,
    drawSheet,
    resample,
    pathLength,
    pointAlong,
    distanceToPolylines,
  };
});
