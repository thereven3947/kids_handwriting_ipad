// Run with: node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const G = require("../guides.js");
const S = require("../scoring.js");
const V = require("../vocabulary.js");
const { scribble } = require("./simulate.js");

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LOWER = UPPER.map((c) => c.toLowerCase());
const ALL = [...UPPER, ...LOWER];

const PROFILES = {
  neat: { wobble: 0.04, drift: 0.04, scale: 1.03, rotate: 2 },
  kid: { wobble: 0.06, drift: 0.07, scale: 1.08, rotate: 4, trim: 0.06, shuffle: true },
  messy: { wobble: 0.09, drift: 0.1, scale: 0.9, rotate: -6, trim: 0.1, reverse: true, stray: true },
};

// Near look-alikes that a lenient judge may confuse (drawn letter -> target box).
const LOOKALIKES = new Set(["c<-s", "g<-s", "o<-e", "G<-O", "Q<-O", "m<-n", "u<-a"]);

function wrongLetterPasses(kind) {
  const accepted = [];
  for (const ch of ALL) {
    const layout = single(kind, ch);
    const pool = ch === ch.toUpperCase() ? UPPER : LOWER;
    for (const other of pool) {
      if (other === ch) continue;
      for (const [seed, wobble] of [[11, 0.03], [7, 0.06]]) {
        const opts = { wobble, center: centerOf(layout.cells[0]), scale: kind === "write" ? 0.8 : 1 };
        const strokes = scribble(single(kind, other).cells[0].strokes, layout.unit, opts, seed);
        if (judgeOne(layout, strokes).state === "pass") accepted.push(`${ch}<-${other}`);
      }
    }
  }
  return [...new Set(accepted)];
}

const single = (kind, ch) => G.computeSheetLayout(800, 420, [{ kind, chars: [ch] }]);
const judgeOne = (layout, strokes) => S.judgeSheet(strokes, layout).cells[layout.cells[0].id];
const centerOf = (cell) => {
  const b = G.boundsOf(cell.strokes.flat());
  return { x: (cell.x0 + cell.x1) / 2, y: (b.minY + b.maxY) / 2 };
};

function passRate(kind, profile, extra = {}) {
  const failures = [];
  ALL.forEach((ch, i) => {
    const layout = single(kind, ch);
    const cell = layout.cells[0];
    const opts = kind === "write" ? { ...profile, scale: (profile.scale || 1) * 0.75, center: centerOf(cell), ...extra } : { ...profile, ...extra };
    const result = judgeOne(layout, scribble(cell.strokes, layout.unit, opts, 97 + i * 13));
    if (result.state !== "pass") failures.push(`${ch}(${result.reason})`);
  });
  return { rate: 1 - failures.length / ALL.length, failures };
}

test("tracing: neat and typical child tracing passes for every letter", () => {
  for (const name of ["neat", "kid"]) {
    const { failures } = passRate("trace", PROFILES[name]);
    assert.deepEqual(failures, [], `${name} tracing failed for ${failures.join(", ")}`);
  }
});

test("tracing: messy tracing (wobble, stray mark, unfinished ends) mostly passes", () => {
  const { rate, failures } = passRate("trace", PROFILES.messy);
  assert.ok(rate >= 0.9, `only ${(rate * 100).toFixed(0)}% passed: ${failures.join(", ")}`);
});

test("tracing: ink drifting inside the judging zone passes, far outside fails", () => {
  for (const ch of ["A", "g", "M", "s"]) {
    const layout = single("trace", ch);
    const cell = layout.cells[0];
    const near = judgeOne(layout, scribble(cell.strokes, layout.unit, { drift: 0.1, wobble: 0.03 }, 5));
    assert.equal(near.state, "pass", `${ch} with a small drift`);
    const far = judgeOne(layout, scribble(cell.strokes, layout.unit, { drift: 0.45, wobble: 0.03 }, 5));
    assert.equal(far.state, "retry", `${ch} drawn far from the track`);
  }
});

test("tracing: about half the ink inside the zone is enough when the shape is right", () => {
  const layout = single("trace", "O");
  const cell = layout.cells[0];
  const result = judgeOne(layout, scribble(cell.strokes, layout.unit, { scale: 1.32, wobble: 0.02 }, 3));
  assert.ok(result.metrics.inZone < 0.85, `expected a loose trace, got ${result.metrics.inZone}`);
  assert.equal(result.state, "pass", JSON.stringify(result.metrics));
});

test("tracing: only part of the letter is not enough", () => {
  for (const ch of ["E", "M", "k"]) {
    const layout = single("trace", ch);
    const cell = layout.cells[0];
    const result = judgeOne(layout, scribble(cell.strokes.slice(0, 1), layout.unit, { wobble: 0.02 }, 2));
    assert.equal(result.state, "retry", `${ch} with only stroke 1`);
  }
});

test("tracing: a different letter over the track is rejected", () => {
  const accepted = wrongLetterPasses("trace");
  assert.deepEqual(accepted.filter((pair) => !LOOKALIKES.has(pair)), []);
  assert.ok(accepted.length <= 4, `too many look-alikes accepted: ${accepted.join(", ")}`);
});

test("writing: letters written smaller, shifted or tilted in the box pass", () => {
  for (const name of ["neat", "kid"]) {
    const { rate, failures } = passRate("write", PROFILES[name]);
    assert.ok(rate >= 0.96, `${name} writing: ${(rate * 100).toFixed(0)}% passed, failed ${failures.join(", ")}`);
  }
  const { rate, failures } = passRate("write", PROFILES.messy, { aspect: 1.15 });
  assert.ok(rate >= 0.85, `messy writing: ${(rate * 100).toFixed(0)}% passed, failed ${failures.join(", ")}`);
});

test("writing: a different letter is rejected", () => {
  const accepted = wrongLetterPasses("write");
  assert.deepEqual(accepted.filter((pair) => !LOOKALIKES.has(pair)), []);
  assert.ok(accepted.length <= 6, `too many look-alikes accepted: ${accepted.join(", ")}`);
});

test("writing: a tiny letter or a scribble is rejected", () => {
  const layout = single("write", "B");
  const cell = layout.cells[0];
  const tiny = judgeOne(layout, scribble(cell.strokes, layout.unit, { scale: 0.15, center: centerOf(cell) }, 1));
  assert.equal(tiny.state, "retry");
  assert.equal(tiny.reason, "too-small");
  const c = centerOf(cell);
  const zigzag = [[0, 1, 2, 3, 4, 5, 6, 7].map((k) => ({ x: c.x - 60 + k * 17, y: c.y + (k % 2 ? 50 : -50) }))];
  assert.equal(judgeOne(layout, zigzag).state, "retry");
});

test("words: every cell is judged on its own", () => {
  const chars = "cat".split("");
  const layout = G.computeSheetLayout(900, 600, [{ kind: "trace", chars }, { kind: "write", chars }], "word");
  const traceRow = layout.rows[0].cells;
  const writeRow = layout.rows[1].cells;
  const ink = [
    ...traceRow.flatMap((cell, i) => scribble(cell.strokes, layout.unit, PROFILES.kid, 20 + i)),
    ...writeRow.flatMap((cell, i) => scribble(cell.strokes, layout.unit, { ...PROFILES.kid, scale: 0.8, center: centerOf(cell) }, 40 + i)),
  ];
  const all = S.judgeSheet(ink, layout);
  assert.ok(all.attempted && all.passed, JSON.stringify(all.cells));
  assert.ok(all.stars >= 1 && all.stars <= 3);

  // Leave the last write box empty: not attempted yet, other cells still pass.
  const withoutLast = ink.filter((s) => S.assignStrokes([s], layout)[writeRow[2].id].length === 0);
  const partial = S.judgeSheet(withoutLast, layout);
  assert.equal(partial.attempted, false);
  assert.equal(partial.cells[writeRow[2].id].state, "empty");
  assert.equal(partial.cells[traceRow[0].id].state, "pass");

  // Write "o" in the "t" box: only that box needs another try.
  const wrongT = scribble(single("write", "o").cells[0].strokes, layout.unit, { scale: 0.6, center: centerOf(writeRow[2]) }, 9);
  const mixed = S.judgeSheet([...withoutLast, ...wrongT], layout);
  assert.equal(mixed.passed, false);
  assert.equal(mixed.cells[writeRow[2].id].state, "retry");
  assert.equal(mixed.cells[writeRow[0].id].state, "pass");
});

test("vocabulary: words are drawable and every letter has an example", () => {
  const seen = new Set();
  const categoryIds = new Set(V.categories.map((c) => c.id));
  assert.ok(V.words.length >= 100, `expected a large word list, got ${V.words.length}`);
  for (const entry of V.words) {
    assert.match(entry.word, /^[a-z]{2,6}$/, `${entry.word} should be 2-6 lowercase letters`);
    assert.ok(entry.picture && entry.sentence, `${entry.word} needs a picture and a sentence`);
    assert.ok(categoryIds.has(entry.category), `${entry.word} has an unknown category`);
    assert.ok(!seen.has(entry.word), `${entry.word} is listed twice`);
    seen.add(entry.word);
    for (const ch of entry.word) assert.ok(G.glyphs[ch], `no guide for ${ch}`);
  }
  for (const category of V.categories) {
    assert.ok(V.words.some((w) => w.category === category.id), `${category.name} is empty`);
  }
  for (const letter of UPPER) {
    const example = V.exampleFor(letter);
    assert.ok(example, `no example word for ${letter}`);
    if (letter !== "X") assert.ok(example.word.startsWith(letter.toLowerCase()), `${letter} example is ${example.word}`);
  }
});
