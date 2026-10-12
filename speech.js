/*
 * Small wrapper around the browser's speech synthesis that copes with common
 * problems: a non-English default voice, voices that load late, Chrome dropping
 * speech that is cancelled and restarted in the same moment, and utterances
 * being garbage-collected before they finish.
 */
(function (root, factory) {
  root.Speaker = factory(root);
})(typeof self !== "undefined" ? self : this, function (win) {
  const synth = win.speechSynthesis;
  const supported = Boolean(synth) && typeof win.SpeechSynthesisUtterance === "function";
  // Voices installed on the device come first: they work offline, start quickly
  // and are the ones the letter-sound spellings were checked with. Online voices
  // (such as Chrome's "Google US English") are only used when nothing else exists
  // or when chosen under "For grown-ups".
  const PREFERRED = [/Samantha/i, /Ava|Allison|Susan|Alex/i, /Zira/i, /Aria|Jenny|Natural/i, /David|Mark/i, /Google US English/i, /Karen|Moira|Daniel/i];

  let voices = [];
  let chosenName = "";
  let token = 0;
  let active = []; // keeps utterances alive until they finish
  const listeners = [];

  function isEnglish(voice) {
    return /^en([-_]|$)/i.test(voice.lang || "");
  }

  function refresh() {
    voices = supported ? synth.getVoices().filter(isEnglish) : [];
    listeners.forEach((fn) => fn(voices));
  }

  if (supported) {
    refresh();
    if (typeof synth.addEventListener === "function") synth.addEventListener("voiceschanged", refresh);
    else synth.onvoiceschanged = refresh;
  }

  function currentVoice() {
    if (chosenName) {
      const chosen = voices.find((v) => v.name === chosenName);
      if (chosen) return chosen;
    }
    const local = voices.filter((v) => v.localService !== false);
    for (const pool of [local, voices]) {
      for (const pattern of PREFERRED) {
        const match = pool.find((v) => pattern.test(v.name) && /en[-_]US/i.test(v.lang)) || pool.find((v) => pattern.test(v.name));
        if (match) return match;
      }
      const fallback = pool.find((v) => /en[-_]US/i.test(v.lang)) || pool[0];
      if (fallback) return fallback;
    }
    return null;
  }

  function stop() {
    token += 1;
    active = [];
    if (supported) synth.cancel();
  }

  // All parts go into ONE utterance, each as its own short sentence:
  // "App! App! Apple!". Measured with Windows voices this gives every part the
  // same pitch and loudness (within ~1 dB) and an even pause between them.
  // - Commas ("app, app, apple") make one sentence with a melody: soft start,
  //   loud middle, fading end.
  // - Separate utterances stop and restart the audio between parts, which many
  //   speakers and headsets clip at the start and end, and a missed "end" event
  //   can stop the rest from playing.
  const RATE = 0.8;
  const PITCH = 1;
  const VOLUME = 1;

  function asSentence(text) {
    const trimmed = String(text).trim();
    if (!trimmed) return "";
    const capital = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    return /[.!?]$/.test(capital) ? capital : `${capital}!`;
  }

  function phrase(parts) {
    return parts.map((part) => asSentence(part.text)).filter(Boolean).join(" ");
  }

  /**
   * parts: [{ text }] spoken in one go, each as its own sentence.
   * onStart / onEnd({ ok, reason }) let the UI show that sound is playing.
   */
  function speak(parts, { onStart, onEnd } = {}) {
    const text = phrase(parts || []);
    if (!supported || !text) {
      if (onEnd) onEnd({ ok: false, reason: "unsupported" });
      return false;
    }
    if (!voices.length) refresh();
    const myToken = ++token;
    const voice = currentVoice();
    let started = false;
    let finished = false;

    const finish = (ok, reason) => {
      if (finished || myToken !== token) return;
      finished = true;
      active = [];
      if (onEnd) onEnd({ ok, reason });
    };

    const u = new win.SpeechSynthesisUtterance(text);
    u.lang = voice ? voice.lang : "en-US";
    if (voice) u.voice = voice;
    u.rate = RATE;
    u.pitch = PITCH;
    u.volume = VOLUME;
    u.onstart = () => {
      started = true;
      if (myToken === token && onStart) onStart(voice);
      // Some browsers never send "end"; stop showing "speaking" after a while.
      setTimeout(() => finish(true), 2500 + parts.length * 2000);
    };
    u.onend = () => finish(true);
    u.onerror = (event) => {
      if (event.error === "interrupted" || event.error === "canceled") return;
      finish(false, event.error || "error");
    };
    active = [u];

    const go = () => {
      if (myToken !== token) return;
      synth.resume();
      synth.speak(u);
    };
    if (synth.speaking || synth.pending) {
      // Cancelling and speaking at the same moment makes Chrome drop the speech.
      synth.cancel();
      setTimeout(go, 80);
    } else {
      go(); // straight away, so iPad Safari sees it as part of the tap
    }

    setTimeout(() => {
      if (!started) finish(false, "no-start");
    }, 4000);
    return true;
  }

  return {
    supported,
    speak,
    stop,
    phrase,
    currentVoice,
    voices: () => voices,
    setVoice(name) {
      chosenName = name || "";
    },
    onVoices(fn) {
      listeners.push(fn);
      fn(voices);
    },
  };
});
