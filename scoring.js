/*
 * Judging for the practice sheet.
 *
 * Each sheet cell is judged on its own:
 *  - Trace cells use a buffer zone around the track. The drawing is good when
 *    enough ink sits inside the zone, enough of the track is covered, and the
 *    overall shape still looks like the letter.
 *  - Write cells (no track) only compare the drawing's shape to the letter with
 *    a $P point-cloud recognizer, so position, size, stroke order and stroke
 *    direction do not matter.
 */
(function (root, factory) {
  const api = factory(root.LetterGuides || (typeof require === "function" ? require("./guides.js") : null));
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.LetterScoring = api;
  }
})(typeof self !== "undefined" ? self : this, function (G) {
  const SETTINGS = {
    // Trace cells, distances in letter-height units.
    zoneRadius: 0.16, // judging buffer on each side of the track centre line
    minInZone: 0.5, // share of ink that must be inside the buffer
    minCoverage: 0.6, // share of the track that must be covered by ink
    traceShapeMax: 0.2, // max shape distance while tracing
    // The target letter must be about as close as the best other same-case
    // letter: distance(target) <= distance(best other) * (1 + margin).
    // Tuned with tests/simulate.js: lenient for wobbly tracing while other
    // letters are still rejected (only near look-alikes such as c/s can slip by).
    traceRankMargin: 0.35,
    // Write cells.
    writeShapeMax: 0.18,
    writeRankMargin: 0.3,
    minWriteSize: 0.3, // ink must be at least this share of the letter's size
  };

  const CLOUD_SIZE = 40;
  const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const LOWER = UPPER.map((c) => c.toLowerCase());

  // ---------- $P point-cloud recognizer ----------

  // Spreads N points along all strokes; dots (tiny strokes) get a few points so
  // the dot on i / j counts.
  function toCloud(strokes, n = CLOUD_SIZE) {
    const parts = strokes.filter((s) => s && s.length);
    if (!parts.length) return [];
    const size = (() => {
      const b = G.boundsOf(parts.flat());
      return Math.max(b.maxX - b.minX, b.maxY - b.minY) || 1;
    })();
    const dotThreshold = size * 0.08;
    const lengths = parts.map((s) => G.pathLength(s));
    const dots = parts.filter((_, i) => lengths[i] < dotThreshold);
    const lines = parts.filter((_, i) => lengths[i] >= dotThreshold);
    const dotPoints = Math.min(Math.floor(n / 8), 4);
    const points = [];
    dots.forEach((dot) => {
      const c = centroid(dot);
      for (let k = 0; k < dotPoints; k += 1) points.push({ x: c.x, y: c.y });
    });
    const total = lines.reduce((sum, s) => sum + G.pathLength(s), 0);
    const remaining = n - points.length;
    if (lines.length && total > 0) {
      let allotted = 0;
      lines.forEach((stroke, i) => {
        const share = i === lines.length - 1 ? remaining - allotted : Math.max(1, Math.round((G.pathLength(stroke) / total) * remaining));
        allotted += share;
        const length = G.pathLength(stroke);
        for (let k = 0; k < share; k += 1) {
          const p = G.pointAlong(stroke, share === 1 ? length / 2 : (length * k) / (share - 1));
          points.push({ x: p.x, y: p.y });
        }
      });
    }
    while (points.length < n) points.push({ ...points[points.length - 1] });
    return normalizeCloud(points.slice(0, n));
  }

  function centroid(points) {
    const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / points.length, y: sum.y / points.length };
  }

  function normalizeCloud(points) {
    const b = G.boundsOf(points);
    const size = Math.max(b.maxX - b.minX, b.maxY - b.minY) || 1;
    const scaled = points.map((p) => ({ x: (p.x - b.minX) / size, y: (p.y - b.minY) / size }));
    const c = centroid(scaled);
    return scaled.map((p) => ({ x: p.x - c.x, y: p.y - c.y }));
  }

  function cloudDistance(a, b, start) {
    const n = a.length;
    const matched = new Array(n).fill(false);
    let sum = 0;
    let weightSum = 0;
    let i = start;
    do {
      let best = Infinity;
      let index = -1;
      for (let j = 0; j < n; j += 1) {
        if (matched[j]) continue;
        const d = Math.hypot(a[i].x - b[j].x, a[i].y - b[j].y);
        if (d < best) {
          best = d;
          index = j;
        }
      }
      matched[index] = true;
      const weight = 1 - ((i - start + n) % n) / n;
      sum += weight * best;
      weightSum += weight;
      i = (i + 1) % n;
    } while (i !== start);
    return sum / weightSum;
  }

  // Average matched-point distance in normalized units (0 = identical shapes).
  function shapeDistance(cloudA, cloudB) {
    if (!cloudA.length || !cloudB.length) return Infinity;
    const step = Math.max(1, Math.floor(Math.sqrt(cloudA.length)));
    let best = Infinity;
    for (let i = 0; i < cloudA.length; i += step) {
      best = Math.min(best, cloudDistance(cloudA, cloudB, i), cloudDistance(cloudB, cloudA, i));
    }
    return best;
  }

  const templateClouds = {};
  function templateCloud(char) {
    if (!templateClouds[char]) templateClouds[char] = toCloud(G.glyphs[char] || []);
    return templateClouds[char];
  }

  // Compares a drawing with every letter of the same case.
  function recognize(strokes, target) {
    const cloud = toCloud(strokes);
    const pool = target === target.toUpperCase() ? UPPER : LOWER;
    const distances = pool.map((char) => ({ char, distance: shapeDistance(cloud, templateCloud(char)) }));
    distances.sort((a, b) => a.distance - b.distance);
    const targetDistance = distances.find((d) => d.char === target).distance;
    const bestOther = distances.find((d) => d.char !== target);
    return {
      distance: targetDistance,
      best: distances[0].char,
      bestOtherDistance: bestOther.distance,
      ratio: targetDistance / Math.max(1e-9, bestOther.distance),
    };
  }

  // ---------- Sheet judging ----------

  // Gives each ink stroke to the cell its centre falls in (or the nearest cell).
  function assignStrokes(strokes, layout) {
    const byCell = {};
    layout.cells.forEach((cell) => {
      byCell[cell.id] = [];
    });
    strokes.forEach((stroke) => {
      if (!stroke || !stroke.length) return;
      const c = centroid(stroke);
      let best = null;
      layout.rows.forEach((row) => {
        const dy = c.y < row.bandTop ? row.bandTop - c.y : c.y > row.bandBottom ? c.y - row.bandBottom : 0;
        row.cells.forEach((cell) => {
          const dx = c.x < cell.x0 ? cell.x0 - c.x : c.x > cell.x1 ? c.x - cell.x1 : 0;
          const score = Math.hypot(dx, dy) * 1000 + Math.abs(c.x - (cell.x0 + cell.x1) / 2);
          if (!best || score < best.score) best = { score, cell };
        });
      });
      if (best) byCell[best.cell.id].push(stroke);
    });
    return byCell;
  }

  function starsFor(quality) {
    return quality >= 0.85 ? 3 : quality >= 0.65 ? 2 : 1;
  }

  function judgeTraceCell(cell, strokes, unit) {
    const zone = SETTINGS.zoneRadius * unit;
    const inkSamples = strokes.flatMap((s) => G.resample(s, unit * 0.03));
    const inZone = inkSamples.filter((p) => G.distanceToPolylines(p, cell.strokes) <= zone).length / inkSamples.length;
    const trackSamples = cell.strokes.flatMap((s) => G.resample(s, unit * 0.04));
    const coverage = trackSamples.filter((p) => G.distanceToPolylines(p, strokes) <= zone).length / trackSamples.length;

    const shape = recognize(strokes, cell.char);
    const shapeOk = shape.distance <= SETTINGS.traceShapeMax && shape.ratio <= 1 + SETTINGS.traceRankMargin;
    const pass = inZone >= SETTINGS.minInZone && coverage >= SETTINGS.minCoverage && shapeOk;
    const quality = 0.4 * inZone + 0.4 * coverage + 0.2 * Math.max(0, 1 - shape.distance / SETTINGS.traceShapeMax);
    return {
      state: pass ? "pass" : "retry",
      stars: pass ? starsFor(quality) : 0,
      quality,
      metrics: { inZone, coverage, shapeDistance: shape.distance, shapeRatio: shape.ratio, looksLike: shape.best },
      reason: pass ? null : coverage < SETTINGS.minCoverage ? "incomplete" : inZone < SETTINGS.minInZone ? "off-track" : "shape",
    };
  }

  function judgeWriteCell(cell, strokes) {
    const ink = G.boundsOf(strokes.flat());
    const target = G.boundsOf(cell.strokes.flat());
    const inkSize = Math.max(ink.maxX - ink.minX, ink.maxY - ink.minY);
    const targetSize = Math.max(target.maxX - target.minX, target.maxY - target.minY);
    const bigEnough = inkSize >= targetSize * SETTINGS.minWriteSize;
    const shape = recognize(strokes, cell.char);
    const pass = bigEnough && shape.distance <= SETTINGS.writeShapeMax && shape.ratio <= 1 + SETTINGS.writeRankMargin;
    const quality = Math.max(0, 1 - shape.distance / (SETTINGS.writeShapeMax * 1.6));
    return {
      state: pass ? "pass" : "retry",
      stars: pass ? starsFor(quality) : 0,
      quality,
      metrics: { shapeDistance: shape.distance, shapeRatio: shape.ratio, looksLike: shape.best, sizeRatio: inkSize / targetSize },
      reason: pass ? null : !bigEnough ? "too-small" : "shape",
    };
  }

  /**
   * Judges all ink on a sheet.
   * Returns { cells: { [id]: result }, attempted, passed, stars }.
   *   attempted - every cell has some ink
   *   passed    - every cell passed
   */
  function judgeSheet(strokes, layout) {
    const byCell = assignStrokes(strokes, layout);
    const cells = {};
    layout.cells.forEach((cell) => {
      const ink = byCell[cell.id].filter((s) => s.length);
      if (!ink.length) {
        cells[cell.id] = { state: "empty", stars: 0, quality: 0, metrics: {}, reason: "empty" };
        return;
      }
      cells[cell.id] = cell.kind === "write" ? judgeWriteCell(cell, ink) : judgeTraceCell(cell, ink, layout.unit);
    });
    const results = Object.values(cells);
    const attempted = results.every((r) => r.state !== "empty");
    const passed = results.every((r) => r.state === "pass");
    const stars = passed ? Math.round(results.reduce((sum, r) => sum + r.stars, 0) / results.length) : 0;
    return { cells, attempted, passed, stars };
  }

  return {
    SETTINGS,
    toCloud,
    shapeDistance,
    recognize,
    assignStrokes,
    judgeSheet,
  };
});
