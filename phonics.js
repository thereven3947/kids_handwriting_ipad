/*
 * Letter sounds (phonics) for each letter, with a picture word for every sound.
 *
 * `say` is what the voice says for the sound. Only real words, letter names and
 * common sounds are used ("ah", "eh", "uh", "buh"...), because voices spell out
 * strings they do not know letter by letter (e.g. "ahh" -> "A-H-H") or add a
 * breathy "h". Long vowels say their name ("A" as in cake). Short a and short i
 * have no clean spelling on their own, so they use the start of the word as in
 * the classic chant: "app, app, apple", "in, in, insect".
 * Each sound is said twice and then the picture word. `mark` is [start, length]
 * of the letters that make the sound in the word; it defaults to the first
 * occurrence of the letter.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.Phonics = api;
  }
})(typeof self !== "undefined" ? self : this, function () {
  const sounds = {
    a: [
      { say: "app", word: "apple", picture: "🍎" },
      { say: "A", word: "cake", picture: "🎂" },
      { say: "ah", word: "watch", picture: "⌚" },
      { say: "uh", word: "sofa", picture: "🛋️", mark: [3, 1] },
    ],
    b: [{ say: "buh", word: "ball", picture: "⚽" }],
    c: [
      { say: "kuh", word: "cat", picture: "🐱" },
      { say: "ssuh", word: "city", picture: "🏙️" },
    ],
    d: [{ say: "duh", word: "dog", picture: "🐶" }],
    e: [
      { say: "eh", word: "egg", picture: "🥚" },
      { say: "E", word: "bee", picture: "🐝", mark: [1, 2] },
    ],
    f: [{ say: "fuh", word: "fish", picture: "🐟" }],
    g: [
      { say: "guh", word: "goat", picture: "🐐" },
      { say: "juh", word: "giraffe", picture: "🦒" },
    ],
    h: [{ say: "huh", word: "hat", picture: "🎩" }],
    i: [
      { say: "in", word: "insect", picture: "🐛" },
      { say: "I", word: "ice", picture: "🧊" },
    ],
    j: [{ say: "juh", word: "juice", picture: "🧃" }],
    k: [{ say: "kuh", word: "kite", picture: "🪁" }],
    l: [{ say: "luh", word: "lion", picture: "🦁" }],
    m: [{ say: "muh", word: "moon", picture: "🌙" }],
    n: [{ say: "nuh", word: "nose", picture: "👃" }],
    o: [
      { say: "ah", word: "octopus", picture: "🐙" },
      { say: "O", word: "bone", picture: "🦴" },
    ],
    p: [{ say: "puh", word: "pig", picture: "🐷" }],
    q: [{ say: "kwuh", word: "queen", picture: "👸", mark: [0, 2] }],
    r: [{ say: "ruh", word: "rabbit", picture: "🐰" }],
    s: [
      { say: "ssuh", word: "sun", picture: "☀️" },
      { say: "zah", word: "rose", picture: "🌹" },
    ],
    t: [{ say: "tuh", word: "tiger", picture: "🐯" }],
    u: [
      { say: "uh", word: "umbrella", picture: "☂️" },
      { say: "U", word: "unicorn", picture: "🦄" },
      { say: "ooh", word: "ruler", picture: "📏" },
    ],
    v: [{ say: "vuh", word: "van", picture: "🚐" }],
    w: [{ say: "wuh", word: "web", picture: "🕸️" }],
    // No voice says a clean /ks/ on its own, so x is taught with words only.
    x: [{ say: null, word: "box", picture: "📦" }],
    y: [
      { say: "yeah", word: "yarn", picture: "🧶" },
      { say: "I", word: "fly", picture: "🪰" },
      { say: "E", word: "happy", picture: "😊", mark: [4, 1] },
    ],
    z: [{ say: "zah", word: "zebra", picture: "🦓" }],
  };

  function soundsFor(letter) {
    const lower = letter.toLowerCase();
    return (sounds[lower] || []).map((sound) => {
      const mark = sound.mark || [sound.word.indexOf(lower), 1];
      return { ...sound, letter: lower, mark };
    });
  }

  // The parts the voice says for one sound, e.g. ["app", "app", "apple"]. They
  // are spoken one at a time so every part has the same loudness and pitch.
  function speechFor(sound) {
    return sound.say ? [sound.say, sound.say, sound.word] : [sound.word, sound.word];
  }

  return { sounds, soundsFor, speechFor };
});
