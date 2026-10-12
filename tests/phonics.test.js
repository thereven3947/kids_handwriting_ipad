// Run with: node --test "tests/*.test.js"
const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../phonics.js");

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

test("phonics: every letter has at least one sound with a picture word", () => {
  for (const letter of LETTERS) {
    const sounds = P.soundsFor(letter.toUpperCase());
    assert.ok(sounds.length >= 1, `${letter} has no sounds`);
    for (const sound of sounds) {
      assert.match(sound.word, /^[a-z]+$/, `${letter}: ${sound.word}`);
      assert.ok(sound.picture, `${letter}: ${sound.word} needs a picture`);
      const [start, length] = sound.mark;
      assert.ok(start >= 0 && start + length <= sound.word.length, `${letter}: bad highlight in ${sound.word}`);
      assert.ok(sound.word.slice(start, start + length).includes(letter), `${letter}: highlight in ${sound.word} misses the letter`);
    }
  }
});

test("phonics: vowels teach more than one sound", () => {
  for (const vowel of ["a", "e", "i", "o", "u"]) {
    assert.ok(P.soundsFor(vowel).length >= 2, `${vowel} should have short and long sounds`);
  }
});

test("phonics: sounds only use spellings that voices say as one sound", () => {
  // Checked against the phonemes Windows voices produce. Made-up strings such as
  // "ahh" or "ihh" get a breathy "h" or are spelled out letter by letter ("A-H-H").
  const SAFE = new Set([
    "A", "E", "I", "O", "U", "app", "in", "ah", "eh", "uh", "ooh", "yeah",
    "buh", "kuh", "duh", "fuh", "guh", "huh", "juh", "luh", "muh", "nuh", "puh", "kwuh", "ruh", "ssuh", "tuh", "vuh", "wuh", "zah",
  ]);
  for (const letter of LETTERS) {
    for (const sound of P.soundsFor(letter)) {
      if (sound.say === null) continue;
      assert.ok(SAFE.has(sound.say), `${letter}: "${sound.say}" is not a checked spelling`);
    }
  }
});

test("phonics: speech repeats the sound and ends with the picture word", () => {
  for (const letter of LETTERS) {
    for (const sound of P.soundsFor(letter)) {
      const parts = P.speechFor(sound);
      assert.equal(parts[parts.length - 1], sound.word);
      if (sound.say) assert.deepEqual(parts, [sound.say, sound.say, sound.word]);
    }
  }
});
