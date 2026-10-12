const G = window.LetterGuides;
const S = window.LetterScoring;
const V = window.Vocabulary;
const P = window.Phonics;
const Speaker = window.Speaker;

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const STORAGE_KEY = "little-letter-practice";
const AUTO_CHECK_DELAY = 2200;
const FEEDBACK_TIME = 1900;

const HINTS = {
  trace: "Follow the numbers 1, 2, 3 and trace on the tracks.",
  both: "Trace the top row, then write it yourself in the boxes below.",
  write: "Write each letter in its box. No tracks this time!",
};

const boardSurface = document.getElementById("board-surface");
const guideCanvas = document.getElementById("guide-canvas");
const inkCanvas = document.getElementById("practice-canvas");
const guideCtx = guideCanvas.getContext("2d");
const inkCtx = inkCanvas.getContext("2d");
const itemSelect = document.getElementById("item-select");
const promptPicture = document.getElementById("prompt-picture");
const targetLetterEl = document.getElementById("target-letter");
const promptCaption = document.getElementById("prompt-caption");
const promptHint = document.getElementById("prompt-hint");
const speakButton = document.getElementById("speak-button");
const soundChips = document.getElementById("sound-chips");
const speechStatus = document.getElementById("speech-status");
const voiceSelect = document.getElementById("voice-select");
const testVoiceButton = document.getElementById("test-voice");
const congratsOverlay = document.getElementById("congrats-overlay");
const rewardStars = document.getElementById("reward-stars");
const rewardTitle = document.getElementById("reward-title");
const rewardText = document.getElementById("reward-text");
const showZoneInput = document.getElementById("show-zone");
const autoCheckInput = document.getElementById("auto-check");
const installButton = document.getElementById("install-button");

const state = {
  kind: "letter",
  letterIndex: 0,
  wordIndex: 0,
  mode: "trace",
  tool: "pen",
  color: "#1E88E5",
  showZone: false,
  autoCheck: true,
  voiceName: "",
};

let layout = null;
let strokes = []; // [{ color, points: [{x, y}] }] in current layout pixels
let activeStroke = null;
let activePointerId = null;
let lastPenTime = 0;
let cellResults = null;
let pendingJudgement = null;
let feedbackTimer = null;
let feedbackVisible = false;
let deferredPrompt = null;

// ---------- Preferences ----------

function loadPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    ["kind", "mode", "color", "voiceName"].forEach((key) => {
      if (typeof saved[key] === "string") state[key] = saved[key];
    });
    ["letterIndex"].forEach((key) => {
      if (Number.isInteger(saved[key])) state[key] = saved[key];
    });
    const savedWord = V.words.findIndex((entry) => entry.word === saved.word);
    if (savedWord !== -1) state.wordIndex = savedWord;
    ["showZone", "autoCheck"].forEach((key) => {
      if (typeof saved[key] === "boolean") state[key] = saved[key];
    });
  } catch (error) {
    // Ignore unreadable preferences.
  }
  if (!["letter", "word"].includes(state.kind)) state.kind = "letter";
  if (!HINTS[state.mode]) state.mode = "trace";
  state.letterIndex = Math.min(Math.max(0, state.letterIndex), LETTERS.length - 1);
  state.wordIndex = Math.min(Math.max(0, state.wordIndex), V.words.length - 1);
}

// Optional links such as ?kind=word&word=cat&mode=both or ?letter=B&mode=write.
function applyUrlOptions() {
  const params = new URLSearchParams(window.location.search);
  const letter = (params.get("letter") || "").toUpperCase();
  const word = (params.get("word") || "").toLowerCase();
  if (LETTERS.includes(letter)) {
    state.kind = "letter";
    state.letterIndex = LETTERS.indexOf(letter);
  }
  const wordIndex = V.words.findIndex((entry) => entry.word === word);
  if (wordIndex !== -1) {
    state.kind = "word";
    state.wordIndex = wordIndex;
  }
  if (["letter", "word"].includes(params.get("kind"))) state.kind = params.get("kind");
  if (HINTS[params.get("mode")]) state.mode = params.get("mode");
  if (params.get("zone") === "1") state.showZone = true;
}

function savePreferences() {
  try {
    const { kind, mode, color, letterIndex, showZone, autoCheck, voiceName } = state;
    const word = currentWord().word;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ kind, mode, color, letterIndex, word, showZone, autoCheck, voiceName }));
  } catch (error) {
    // Private browsing can block storage; the app still works.
  }
}

// ---------- What is being practiced ----------

function currentWord() {
  return V.words[state.wordIndex];
}

function currentChars() {
  if (state.kind === "word") return currentWord().word.split("");
  const letter = LETTERS[state.letterIndex];
  return [letter, letter.toLowerCase()];
}

function currentRows() {
  const chars = currentChars();
  if (state.mode === "write") return [{ kind: "write", chars }];
  if (state.mode === "both") return [{ kind: "trace", chars }, { kind: "write", chars }];
  return [{ kind: "trace", chars }];
}

function populatePicker() {
  itemSelect.innerHTML = "";
  if (state.kind === "word") {
    // Grouped by topic so the long word list is easy to browse.
    V.categories.forEach((category) => {
      const group = document.createElement("optgroup");
      group.label = `${category.icon} ${category.name}`;
      V.words.forEach((entry, index) => {
        if (entry.category === category.id) group.append(new Option(`${entry.picture} ${entry.word}`, String(index)));
      });
      itemSelect.append(group);
    });
    itemSelect.value = String(state.wordIndex);
    itemSelect.setAttribute("aria-label", "Choose a word");
  } else {
    LETTERS.forEach((letter, index) => {
      itemSelect.add(new Option(`${letter} ${letter.toLowerCase()}`, String(index)));
    });
    itemSelect.value = String(state.letterIndex);
    itemSelect.setAttribute("aria-label", "Choose a letter");
  }
}

function updatePrompt() {
  if (state.kind === "word") {
    const entry = currentWord();
    promptPicture.textContent = entry.picture;
    targetLetterEl.textContent = entry.word;
    promptCaption.textContent = entry.sentence;
  } else {
    const letter = LETTERS[state.letterIndex];
    const example = V.exampleFor(letter);
    targetLetterEl.textContent = letter + letter.toLowerCase();
    promptPicture.textContent = example ? example.picture : "✏️";
    promptCaption.textContent = example
      ? example.word.startsWith(letter.toLowerCase())
        ? `${letter} is for ${example.word}`
        : `${letter.toLowerCase()} is in ${example.word}`
      : `Let's write ${letter}`;
  }
  promptHint.textContent = HINTS[state.mode];
  renderSoundChips();

  document.querySelectorAll("#kind-toggle [data-kind]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.kind === state.kind));
  });
  document.querySelectorAll("#mode-toggle [data-mode]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.mode === state.mode));
  });
}

// ---------- Canvas sizing and drawing ----------

function sizeCanvas(canvas, ctx, width, height, ratio) {
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

// Rebuilds the layout. When only the size changed, the ink is moved with it.
function refreshLayout({ keepInk }) {
  const rect = boardSurface.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  const ratio = window.devicePixelRatio || 1;
  sizeCanvas(guideCanvas, guideCtx, width, height, ratio);
  sizeCanvas(inkCanvas, inkCtx, width, height, ratio);

  const spacing = state.kind === "word" ? "word" : "letter";
  const nextLayout = G.computeSheetLayout(width, height, currentRows(), spacing);
  if (keepInk && layout) {
    strokes = strokes.map((stroke) => ({
      ...stroke,
      points: stroke.points.map((p) => G.remapPoint(p, layout, nextLayout)),
    }));
  } else {
    strokes = [];
    cellResults = null;
  }
  layout = nextLayout;
  renderGuide();
  renderInk();
}

function penWidth() {
  return Math.min(12, Math.max(4, layout.unit * 0.045));
}

function renderGuide() {
  const rect = boardSurface.getBoundingClientRect();
  guideCtx.clearRect(0, 0, rect.width, rect.height);
  G.drawSheet(guideCtx, layout, {
    zoneRadius: state.showZone ? S.SETTINGS.zoneRadius * layout.unit : 0,
    results: cellResults,
  });
}

function strokeStyle(color) {
  inkCtx.lineCap = "round";
  inkCtx.lineJoin = "round";
  inkCtx.lineWidth = penWidth();
  inkCtx.strokeStyle = color;
  inkCtx.fillStyle = color;
}

function drawStroke(stroke) {
  const pts = stroke.points;
  if (!pts.length) return;
  strokeStyle(stroke.color);
  if (pts.length === 1) {
    inkCtx.beginPath();
    inkCtx.arc(pts[0].x, pts[0].y, penWidth() / 2, 0, Math.PI * 2);
    inkCtx.fill();
    return;
  }
  inkCtx.beginPath();
  inkCtx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i += 1) inkCtx.lineTo(pts[i].x, pts[i].y);
  inkCtx.stroke();
}

function renderInk() {
  const rect = boardSurface.getBoundingClientRect();
  inkCtx.clearRect(0, 0, rect.width, rect.height);
  strokes.forEach(drawStroke);
}

// ---------- Pointer input (finger, mouse, Apple Pencil) ----------

function pointFromEvent(event) {
  const rect = inkCanvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function eventsFor(event) {
  const coalesced = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : [];
  return coalesced && coalesced.length ? coalesced : [event];
}

function eraseAt(point) {
  const radius = Math.max(14, layout.unit * 0.09);
  let changed = false;
  const next = [];
  strokes.forEach((stroke) => {
    let piece = [];
    stroke.points.forEach((p) => {
      if (Math.hypot(p.x - point.x, p.y - point.y) <= radius) {
        changed = true;
        if (piece.length) next.push({ color: stroke.color, points: piece });
        piece = [];
      } else {
        piece.push(p);
      }
    });
    if (piece.length) next.push({ color: stroke.color, points: piece });
  });
  if (changed) {
    strokes = next;
    renderInk();
  }
}

function clearResults() {
  if (cellResults) {
    cellResults = null;
    renderGuide();
  }
}

function onPointerDown(event) {
  if (feedbackVisible || activePointerId !== null) return;
  if (event.pointerType === "pen") lastPenTime = Date.now();
  // Palm rejection: while an Apple Pencil is in use, ignore resting hands.
  if (event.pointerType === "touch" && Date.now() - lastPenTime < 4000) return;
  if (event.button > 0) return;

  event.preventDefault();
  activePointerId = event.pointerId;
  try {
    inkCanvas.setPointerCapture(event.pointerId);
  } catch (error) {
    // Some synthetic or already-ended pointers cannot be captured; drawing still works.
  }
  cancelPendingJudgement();
  clearResults();

  const point = pointFromEvent(event);
  if (state.tool === "eraser") {
    eraseAt(point);
    return;
  }
  activeStroke = { color: state.color, points: [point] };
  strokes.push(activeStroke);
  drawStroke(activeStroke);
}

function onPointerMove(event) {
  if (event.pointerId !== activePointerId) return;
  event.preventDefault();
  if (event.pointerType === "pen") lastPenTime = Date.now();

  eventsFor(event).forEach((sample) => {
    const point = pointFromEvent(sample);
    if (state.tool === "eraser") {
      eraseAt(point);
      return;
    }
    if (!activeStroke) return;
    const last = activeStroke.points[activeStroke.points.length - 1];
    if (Math.hypot(point.x - last.x, point.y - last.y) < 1) return;
    activeStroke.points.push(point);
    strokeStyle(activeStroke.color);
    inkCtx.beginPath();
    inkCtx.moveTo(last.x, last.y);
    inkCtx.lineTo(point.x, point.y);
    inkCtx.stroke();
  });
}

function onPointerEnd(event) {
  if (event.pointerId !== activePointerId) return;
  activePointerId = null;
  const finishedPen = state.tool === "pen" && activeStroke;
  activeStroke = null;
  if (finishedPen) scheduleJudgement();
}

// ---------- Judging and feedback ----------

function inkPoints() {
  return strokes.map((stroke) => stroke.points);
}

function cancelPendingJudgement() {
  if (pendingJudgement) {
    clearTimeout(pendingJudgement);
    pendingJudgement = null;
  }
}

function scheduleJudgement() {
  cancelPendingJudgement();
  if (!state.autoCheck) return;
  pendingJudgement = setTimeout(() => {
    pendingJudgement = null;
    const judgement = S.judgeSheet(inkPoints(), layout);
    // Wait until every box has been tried before giving feedback.
    if (judgement.attempted) showFeedback(judgement);
  }, AUTO_CHECK_DELAY);
}

function checkAnswer() {
  cancelPendingJudgement();
  if (feedbackVisible) return;
  showFeedback(S.judgeSheet(inkPoints(), layout));
}

function successMessage() {
  if (state.kind === "word") {
    const entry = currentWord();
    return `You wrote “${entry.word}”! ${entry.picture}`;
  }
  return state.mode === "trace" ? "You traced it nicely!" : "You wrote it nicely!";
}

function retryMessage(judgement) {
  const results = Object.values(judgement.cells);
  if (results.every((r) => r.state === "empty")) return "Let's write! Start at the green number 1.";
  if (results.some((r) => r.state === "empty")) return "Keep going and fill in every letter.";
  if (results.some((r) => r.reason === "too-small")) return "Write a little bigger, from line to line.";
  if (results.some((r) => r.reason === "incomplete")) return "Finish every part of the letter.";
  return "Try the orange ones again. You can do it!";
}

function showFeedback(judgement) {
  if (window.location.search.includes("debug")) console.table(judgement.cells);
  cellResults = judgement.cells;
  renderGuide();

  feedbackVisible = true;
  congratsOverlay.classList.remove("hidden", "failure");
  if (judgement.passed) {
    rewardStars.textContent = "⭐".repeat(Math.max(1, judgement.stars));
    rewardTitle.textContent = judgement.stars >= 3 ? "Amazing!" : judgement.stars === 2 ? "Great Job!" : "Good Work!";
    rewardText.textContent = successMessage();
  } else {
    congratsOverlay.classList.add("failure");
    rewardStars.textContent = "💪";
    rewardTitle.textContent = "Almost!";
    rewardText.textContent = retryMessage(judgement);
  }
  requestAnimationFrame(() => congratsOverlay.classList.add("visible"));

  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    congratsOverlay.classList.remove("visible");
    setTimeout(() => {
      congratsOverlay.classList.add("hidden");
      feedbackVisible = false;
      if (judgement.passed) {
        step(1);
      } else {
        keepOnlyPassedInk(judgement);
      }
    }, 250);
  }, FEEDBACK_TIME);
}

// After "Almost!", keep the boxes that were right and clear the rest.
function keepOnlyPassedInk(judgement) {
  const byCell = S.assignStrokes(inkPoints(), layout);
  const keep = new Set();
  Object.entries(byCell).forEach(([id, cellStrokes]) => {
    if (judgement.cells[id] && judgement.cells[id].state === "pass") cellStrokes.forEach((s) => keep.add(s));
  });
  strokes = strokes.filter((stroke) => keep.has(stroke.points));
  cellResults = Object.fromEntries(Object.entries(judgement.cells).filter(([, r]) => r.state === "pass"));
  renderGuide();
  renderInk();
}

// ---------- Navigation ----------

function startFresh() {
  cancelPendingJudgement();
  updatePrompt();
  refreshLayout({ keepInk: false });
  savePreferences();
}

function step(delta) {
  if (state.kind === "word") {
    state.wordIndex = (state.wordIndex + delta + V.words.length) % V.words.length;
    itemSelect.value = String(state.wordIndex);
  } else {
    state.letterIndex = (state.letterIndex + delta + LETTERS.length) % LETTERS.length;
    itemSelect.value = String(state.letterIndex);
  }
  startFresh();
}

function setKind(kind) {
  if (kind === state.kind) return;
  state.kind = kind;
  populatePicker();
  startFresh();
}

function setMode(mode) {
  if (mode === state.mode) return;
  state.mode = mode;
  startFresh();
}

function setTool(tool) {
  state.tool = tool;
  inkCanvas.classList.toggle("erasing", tool === "eraser");
  document.querySelectorAll(".tool-button[data-tool]").forEach((button) => {
    button.classList.toggle("primary", button.dataset.tool === tool);
  });
}

function setColor(color) {
  state.color = color;
  document.querySelectorAll(".swatch").forEach((button) => {
    button.classList.toggle("active", button.dataset.color === color);
  });
  savePreferences();
}

function clearBoard() {
  cancelPendingJudgement();
  strokes = [];
  cellResults = null;
  renderGuide();
  renderInk();
}

// ---------- Sound ----------

function chip(content, label, parts) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "sound-chip";
  button.setAttribute("aria-label", label);
  button.append(...content);
  button.addEventListener("click", () => say(parts, button));
  return button;
}

function textNode(text, tag) {
  if (!tag) return document.createTextNode(text);
  const el = document.createElement(tag);
  el.textContent = text;
  return el;
}

// Letters: the letter name plus one button per sound ("ahh" as in apple...).
// Words: a "spell it" button.
function renderSoundChips() {
  soundChips.innerHTML = "";
  if (!Speaker.supported) return;
  if (state.kind === "word") {
    const entry = currentWord();
    const letters = entry.word.toUpperCase().split("");
    soundChips.append(
      chip([textNode("🔤 Spell it")], `Spell ${entry.word}`, [...letters.map((l) => ({ text: l })), { text: entry.word }])
    );
    return;
  }
  const letter = LETTERS[state.letterIndex];
  soundChips.append(chip([textNode("🔤 "), textNode(`${letter} ${letter.toLowerCase()}`, "b")], `Letter name ${letter}`, [{ text: letter }]));
  P.soundsFor(letter).forEach((sound) => {
    const [start, length] = sound.mark;
    const content = [
      textNode(`${sound.picture} `),
      textNode(sound.word.slice(0, start)),
      textNode(sound.word.slice(start, start + length), "b"),
      textNode(sound.word.slice(start + length)),
    ];
    soundChips.append(chip(content, `${letter} sound as in ${sound.word}`, soundParts(sound)));
  });
}

function soundParts(sound) {
  return P.speechFor(sound).map((text) => ({ text }));
}

function showSpeechStatus(message) {
  speechStatus.textContent = message || "";
  speechStatus.classList.toggle("hidden", !message);
}

function say(parts, button) {
  document.querySelectorAll(".speaking").forEach((el) => el.classList.remove("speaking"));
  if (!Speaker.supported) {
    showSpeechStatus("🔇 This browser can't talk. Try Safari on iPad, or Chrome / Edge.");
    return;
  }
  if (button) button.classList.add("speaking");
  showSpeechStatus("");
  Speaker.speak(parts, {
    onEnd: ({ ok, reason }) => {
      if (button) button.classList.remove("speaking");
      if (!ok) {
        showSpeechStatus(
          reason === "no-start"
            ? "🔇 No sound started. Check the volume, or pick another voice under “For grown-ups”."
            : "🔇 Sound didn't work here. Try another voice, or open the app in Safari / Chrome / Edge."
        );
      }
    },
  });
}

function speakPrompt() {
  if (state.kind === "word") {
    const entry = currentWord();
    say([{ text: entry.word }, { text: entry.sentence }], speakButton);
    return;
  }
  // The letter name, then every sound it makes with its picture word:
  // "A! App! Apple! A! Cake! Ah! Watch! Uh! Sofa!"
  const letter = LETTERS[state.letterIndex];
  const parts = [{ text: letter }];
  P.soundsFor(letter).forEach((sound) => {
    if (sound.say) parts.push({ text: sound.say });
    parts.push({ text: sound.word });
  });
  say(parts, speakButton);
}

function populateVoices(voices) {
  const current = state.voiceName;
  voiceSelect.innerHTML = "";
  voiceSelect.add(new Option("Automatic (English)", ""));
  voices.forEach((voice) => voiceSelect.add(new Option(`${voice.name} (${voice.lang})`, voice.name)));
  voiceSelect.value = voices.some((v) => v.name === current) ? current : "";
}

async function resetStaleServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
}

// ---------- Wiring ----------

inkCanvas.addEventListener("pointerdown", onPointerDown);
inkCanvas.addEventListener("pointermove", onPointerMove);
inkCanvas.addEventListener("pointerup", onPointerEnd);
inkCanvas.addEventListener("pointercancel", onPointerEnd);
inkCanvas.addEventListener("lostpointercapture", onPointerEnd);
// Stop iOS from scrolling or showing the magnifier while drawing.
inkCanvas.addEventListener("touchstart", (event) => event.preventDefault(), { passive: false });
inkCanvas.addEventListener("contextmenu", (event) => event.preventDefault());

document.querySelectorAll("#kind-toggle [data-kind]").forEach((button) => {
  button.addEventListener("click", () => setKind(button.dataset.kind));
});
document.querySelectorAll("#mode-toggle [data-mode]").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});
document.querySelector("[data-action='prev']").addEventListener("click", () => step(-1));
document.querySelector("[data-action='next']").addEventListener("click", () => step(1));
itemSelect.addEventListener("change", () => {
  const index = Number(itemSelect.value);
  if (state.kind === "word") state.wordIndex = index;
  else state.letterIndex = index;
  startFresh();
});
document.querySelector("[data-action='clear']").addEventListener("click", clearBoard);
document.querySelector("[data-action='check']").addEventListener("click", checkAnswer);
document.querySelectorAll("[data-tool]").forEach((button) => {
  button.addEventListener("click", () => setTool(button.dataset.tool));
});
document.querySelectorAll(".swatch").forEach((button) => {
  button.addEventListener("click", () => setColor(button.dataset.color));
});
speakButton.addEventListener("click", speakPrompt);
if (!Speaker.supported) speakButton.classList.add("hidden");
voiceSelect.addEventListener("change", () => {
  state.voiceName = voiceSelect.value;
  Speaker.setVoice(state.voiceName);
  savePreferences();
});
testVoiceButton.addEventListener("click", () => {
  const voice = Speaker.currentVoice();
  say([{ text: "Hello! Let's practice writing." }], testVoiceButton);
  if (voice) showSpeechStatus(`🔊 Speaking with ${voice.name}. If you hear nothing, check the volume.`);
});

showZoneInput.addEventListener("change", () => {
  state.showZone = showZoneInput.checked;
  renderGuide();
  savePreferences();
});
autoCheckInput.addEventListener("change", () => {
  state.autoCheck = autoCheckInput.checked;
  if (!state.autoCheck) cancelPendingJudgement();
  savePreferences();
});

let resizeFrame = null;
const onResize = () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => refreshLayout({ keepInk: true }));
};
if ("ResizeObserver" in window) {
  new ResizeObserver(onResize).observe(boardSurface);
} else {
  window.addEventListener("resize", onResize);
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installButton.classList.remove("hidden");
});

installButton.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installButton.classList.add("hidden");
});

window.addEventListener("appinstalled", () => {
  installButton.classList.add("hidden");
});

resetStaleServiceWorker();
loadPreferences();
applyUrlOptions();
Speaker.setVoice(state.voiceName);
Speaker.onVoices(populateVoices);
showZoneInput.checked = state.showZone;
autoCheckInput.checked = state.autoCheck;
populatePicker();
setTool("pen");
setColor(state.color);
updatePrompt();
refreshLayout({ keepInk: false });
