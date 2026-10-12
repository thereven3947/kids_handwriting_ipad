// Run with: node --test "tests/*.test.js"
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

function loadSpeaker(voices, speakImpl = () => {}) {
  const fakeWindow = {
    speechSynthesis: {
      speaking: false,
      pending: false,
      getVoices: () => voices,
      addEventListener() {},
      speak: (u) => speakImpl(u),
      cancel() {},
      resume() {},
    },
    SpeechSynthesisUtterance: function SpeechSynthesisUtterance(text) {
      this.text = text;
    },
  };
  global.self = fakeWindow;
  const file = path.join(__dirname, "..", "speech.js");
  delete require.cache[require.resolve(file)];
  require(file);
  delete global.self;
  return fakeWindow.Speaker;
}

const voice = (name, lang, localService = true, isDefault = false) => ({ name, lang, localService, default: isDefault });

test("speech: Chrome on Windows picks an installed English voice, not the default Chinese or an online voice", () => {
  const speaker = loadSpeaker([
    voice("Microsoft Hanhan - Chinese (Traditional, Taiwan)", "zh-TW", true, true),
    voice("Microsoft David - English (United States)", "en-US"),
    voice("Microsoft Zira - English (United States)", "en-US"),
    voice("Google US English", "en-US", false),
    voice("Google 國語（臺灣）", "zh-TW", false),
  ]);
  assert.equal(speaker.currentVoice().name, "Microsoft Zira - English (United States)");
  assert.ok(speaker.voices().every((v) => v.lang.startsWith("en")), "only English voices are offered");
});

test("speech: iPad picks Samantha", () => {
  const speaker = loadSpeaker([voice("Daniel", "en-GB"), voice("Samantha", "en-US"), voice("Mei-Jia", "zh-TW", true, true)]);
  assert.equal(speaker.currentVoice().name, "Samantha");
});

test("speech: online voices are used when nothing is installed, and a chosen voice wins", () => {
  const speaker = loadSpeaker([voice("Google US English", "en-US", false), voice("Google UK English Female", "en-GB", false)]);
  assert.equal(speaker.currentVoice().name, "Google US English");
  speaker.setVoice("Google UK English Female");
  assert.equal(speaker.currentVoice().name, "Google UK English Female");
});

test("speech: all parts are spoken as one utterance, one short sentence each", async () => {
  const spoken = [];
  const speaker = loadSpeaker([voice("Microsoft Zira - English (United States)", "en-US")], (u) => {
    spoken.push(u);
    setTimeout(() => u.onstart && u.onstart(), 1);
    setTimeout(() => u.onend && u.onend(), 20);
  });
  const result = await new Promise((resolve) => {
    speaker.speak([{ text: "app" }, { text: "app" }, { text: "apple" }], { onEnd: resolve });
  });
  assert.equal(result.ok, true);
  assert.equal(spoken.length, 1, "one continuous utterance, so the audio never stops between parts");
  assert.equal(spoken[0].text, "App! App! Apple!");
  assert.equal(spoken[0].volume, 1);
  assert.equal(speaker.phrase([{ text: "cat" }, { text: "The cat says meow." }]), "Cat! The cat says meow.");
  assert.equal(speaker.phrase([{ text: "C" }, { text: "A" }, { text: "T" }, { text: "cat" }]), "C! A! T! Cat!");
});

test("speech: a new tap stops the old speech", async () => {
  const spoken = [];
  const speaker = loadSpeaker([voice("Samantha", "en-US")], (u) => {
    spoken.push(u.text);
    setTimeout(() => u.onstart && u.onstart(), 1);
    setTimeout(() => u.onend && u.onend(), 20);
  });
  let firstEnded = false;
  speaker.speak([{ text: "one" }, { text: "two" }], { onEnd: () => (firstEnded = true) });
  const second = await new Promise((resolve) => speaker.speak([{ text: "cat" }], { onEnd: resolve }));
  assert.equal(second.ok, true);
  assert.equal(firstEnded, false, "the replaced speech does not report finishing");
  assert.deepEqual(spoken, ["One! Two!", "Cat!"]);
});
