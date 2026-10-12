// Run with: node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const G = require("../guides.js");

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LOWER = UPPER.map((c) => c.toLowerCase());
const ASCENDERS = new Set(["b", "d", "f", "h", "k", "l"]);
const DESCENDERS = new Set(["g", "j", "p", "q", "y"]);
const DOTTED = new Set(["i", "j"]);
const EPS = 0.03;

// Typical stroke counts in Zaner-Bloser style manuscript.
const EXPECTED_STROKES = {
  A: 3, B: 3, C: 1, D: 2, E: 4, F: 3, G: 1, H: 3, I: 3, J: 1, K: 2, L: 1, M: 2,
  N: 2, O: 1, P: 2, Q: 2, R: 2, S: 1, T: 2, U: 1, V: 1, W: 1, X: 2, Y: 2, Z: 1,
  a: 2, b: 2, c: 1, d: 2, e: 1, f: 2, g: 2, h: 2, i: 2, j: 2, k: 2, l: 1, m: 3,
  n: 2, o: 1, p: 2, q: 2, r: 2, s: 1, t: 2, u: 2, v: 1, w: 1, x: 2, y: 2, z: 1,
};

const glyphBounds = (ch) => G.boundsOf(G.glyphs[ch].flat());

function connectedComponents(strokes, tolerance) {
  const dense = strokes.map((s) => G.resample(s, 0.01));
  const parent = strokes.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < strokes.length; i += 1) {
    for (let j = i + 1; j < strokes.length; j += 1) {
      const touches = dense[i].some((p) => G.distanceToPolylines(p, [strokes[j]]) <= tolerance);
      if (touches) parent[find(i)] = find(j);
    }
  }
  return new Set(strokes.map((_, i) => find(i))).size;
}

test("every letter A-Z and a-z has a guide", () => {
  for (const ch of [...UPPER, ...LOWER]) {
    assert.ok(Array.isArray(G.glyphs[ch]) && G.glyphs[ch].length > 0, `missing guide for ${ch}`);
  }
});

for (const ch of [...UPPER, ...LOWER]) {
  test(`letter "${ch}" has a valid track`, () => {
    const strokes = G.glyphs[ch];

    for (const [i, stroke] of strokes.entries()) {
      for (const p of stroke) {
        assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y), `${ch} stroke ${i + 1} has a non-finite point`);
      }
      if (stroke.length > 1) {
        assert.ok(G.pathLength(stroke) > 0.1, `${ch} stroke ${i + 1} is too short`);
      }
    }

    assert.equal(strokes.length, EXPECTED_STROKES[ch], `${ch} stroke count`);

    // Sits on the handwriting lines.
    const b = glyphBounds(ch);
    const isUpper = ch === ch.toUpperCase();
    assert.ok(b.minY >= G.lines.TOP - EPS, `${ch} pokes above the top line`);
    if (isUpper) {
      assert.ok(Math.abs(b.minY - G.lines.TOP) <= EPS, `${ch} should start at the top line (minY=${b.minY})`);
      assert.ok(Math.abs(b.maxY - G.lines.BASE) <= EPS, `${ch} should sit on the baseline (maxY=${b.maxY})`);
    } else {
      const expectedTop = ASCENDERS.has(ch) ? G.lines.TOP : ch === "t" ? 0.2 : DOTTED.has(ch) ? 0.3 : G.lines.MID;
      const expectedBottom = DESCENDERS.has(ch) ? G.lines.DESC : G.lines.BASE;
      assert.ok(Math.abs(b.minY - expectedTop) <= EPS, `${ch} top is ${b.minY.toFixed(2)}, expected ${expectedTop}`);
      assert.ok(Math.abs(b.maxY - expectedBottom) <= EPS, `${ch} bottom is ${b.maxY.toFixed(2)}, expected ${expectedBottom}`);
    }
    const width = b.maxX - b.minX;
    assert.ok(width > 0.3 || ch === "l" || ch === "i" || ch === "I", `${ch} is too narrow (${width.toFixed(2)})`);
    assert.ok(width <= 1, `${ch} is too wide (${width.toFixed(2)})`);

    // Every stroke starts at its own top (pull down) or its own left (slide right).
    for (const [i, stroke] of strokes.entries()) {
      if (stroke.length === 1) continue;
      const sb = G.boundsOf(stroke);
      const start = stroke[0];
      const startsTop = start.y - sb.minY <= 0.15;
      const startsLeft = start.x - sb.minX <= 0.05;
      assert.ok(startsTop || startsLeft, `${ch} stroke ${i + 1} starts at the bottom/right (${start.x.toFixed(2)}, ${start.y.toFixed(2)})`);
    }

    // Strokes form one connected letter (dots on i/j are separate on purpose).
    const solid = strokes.filter((s) => s.length > 1);
    assert.equal(connectedComponents(solid, 0.04), 1, `${ch} has disconnected pieces`);
    for (const dot of strokes.filter((s) => s.length === 1)) {
      assert.ok(G.distanceToPolylines(dot[0], solid) > 0.12, `${ch} dot touches the letter`);
    }
  });
}

const SIZES = [[700, 420], [1000, 420], [360, 260], [820, 760], [1180, 700]];
const VOCAB = require("../vocabulary.js");

function checkSheet(layout, w, h, label) {
  for (const row of layout.rows) {
    for (const cell of row.cells) {
      const box = G.boundsOf(cell.strokes.flat());
      assert.ok(cell.x0 >= 0 && cell.x1 <= w, `${label}: cell ${cell.char} leaves the canvas sideways`);
      assert.ok(box.minX >= cell.x0 - 0.5 && box.maxX <= cell.x1 + 0.5, `${label}: ${cell.char} sticks out of its cell`);
      assert.ok(row.bandTop >= -0.5 && row.bandBottom <= h + 0.5, `${label}: row leaves the canvas`);
    }
    for (let i = 1; i < row.cells.length; i += 1) {
      assert.ok(row.cells[i].x0 >= row.cells[i - 1].x1, `${label}: cells overlap`);
    }
  }
  for (let i = 1; i < layout.rows.length; i += 1) {
    assert.ok(layout.rows[i].bandTop >= layout.rows[i - 1].bandBottom - 0.5, `${label}: rows overlap`);
  }
}

test("letter sheets fit the canvas in every mode and size", () => {
  for (const ch of UPPER) {
    const chars = [ch, ch.toLowerCase()];
    for (const [w, h] of SIZES) {
      for (const rows of [[{ kind: "trace", chars }], [{ kind: "write", chars }], [{ kind: "trace", chars }, { kind: "write", chars }]]) {
        const layout = G.computeSheetLayout(w, h, rows, "letter");
        checkSheet(layout, w, h, `${ch} ${w}x${h} ${rows.map((r) => r.kind).join("+")}`);
        const [upper, lower] = layout.rows[0].cells;
        if (rows[0].kind === "trace") {
          const gap = G.boundsOf(lower.strokes.flat()).minX - G.boundsOf(upper.strokes.flat()).maxX;
          assert.ok(gap >= layout.unit * 0.4, `${ch}${ch.toLowerCase()} are too close on ${w}x${h}`);
        }
      }
    }
  }
});

test("word sheets fit the canvas in every mode and size", () => {
  for (const { word } of VOCAB.words) {
    const chars = word.split("");
    for (const [w, h] of SIZES) {
      for (const rows of [[{ kind: "trace", chars }], [{ kind: "write", chars }], [{ kind: "trace", chars }, { kind: "write", chars }]]) {
        checkSheet(G.computeSheetLayout(w, h, rows, "word"), w, h, `${word} ${w}x${h}`);
      }
    }
  }
});

test("ink can be moved to a resized layout of the same sheet", () => {
  const rows = [{ kind: "trace", chars: ["c", "a", "t"] }];
  const small = G.computeSheetLayout(500, 300, rows, "word");
  const big = G.computeSheetLayout(1100, 700, rows, "word");
  const start = small.cells[1].strokes[0][0];
  const moved = G.remapPoint(start, small, big);
  const expected = big.cells[1].strokes[0][0];
  assert.ok(Math.hypot(moved.x - expected.x, moved.y - expected.y) < 0.5);
});
