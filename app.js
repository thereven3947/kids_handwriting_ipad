const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

const requiredStrokesByLetter = {
  // UPPERCASE
  A: 3,
  B: 3,
  C: 1,
  D: 2,
  E: 4,
  F: 3,
  G: 2,
  H: 3,
  I: 2,
  J: 2,
  K: 3,
  L: 2,
  M: 4,
  N: 3,
  O: 1,
  P: 2,
  Q: 2,
  R: 3,
  S: 1,
  T: 2,
  U: 1,
  V: 2,
  W: 3,
  X: 2,
  Y: 2,
  Z: 3,

  // LOWERCASE (examples, you can extend)
  a: 2,
  b: 2,
  c: 1,
  d: 2,
  e: 2,
  f: 2,
  g: 2,
  h: 2,
  i: 2,
  j: 2,
  k: 2,
  l: 1,
  m: 3,
  n: 2,
  o: 1,
  p: 2,
  q: 2,
  r: 1,
  s: 1,
  t: 2,
  u: 1,
  v: 1,
  w: 2,
  x: 2,
  y: 2,
  z: 1,
};

const guidePathsByLetter = {
  // UPPERCASE – hybrid, multi‑stroke, clean

  A: [
    // left diagonal
    [{ x: 0.3, y: 0.85 }, { x: 0.5, y: 0.15 }],
    // right diagonal
    [{ x: 0.5, y: 0.15 }, { x: 0.7, y: 0.85 }],
    // crossbar
    [{ x: 0.38, y: 0.55 }, { x: 0.62, y: 0.55 }],
  ],

  B: [
    // spine
    [{ x: 0.3, y: 0.15 }, { x: 0.3, y: 0.85 }],
    // upper curve
    [{ x: 0.3, y: 0.15 }, { x: 0.6, y: 0.2 }, { x: 0.6, y: 0.4 }, { x: 0.3, y: 0.45 }],
    // lower curve
    [{ x: 0.3, y: 0.45 }, { x: 0.6, y: 0.5 }, { x: 0.6, y: 0.8 }, { x: 0.3, y: 0.85 }],
  ],

  C: [
    [{ x: 0.7, y: 0.2 }, { x: 0.5, y: 0.15 }, { x: 0.3, y: 0.3 }, { x: 0.25, y: 0.5 }, { x: 0.3, y: 0.7 }, { x: 0.5, y: 0.85 }, { x: 0.7, y: 0.8 }],
  ],

  D: [
    // spine
    [{ x: 0.3, y: 0.15 }, { x: 0.3, y: 0.85 }],
    // curve
    [{ x: 0.3, y: 0.15 }, { x: 0.6, y: 0.25 }, { x: 0.7, y: 0.5 }, { x: 0.6, y: 0.75 }, { x: 0.3, y: 0.85 }],
  ],

  E: [
    // spine
    [{ x: 0.3, y: 0.15 }, { x: 0.3, y: 0.85 }],
    // top bar
    [{ x: 0.3, y: 0.15 }, { x: 0.7, y: 0.15 }],
    // middle bar
    [{ x: 0.3, y: 0.5 }, { x: 0.6, y: 0.5 }],
    // bottom bar
    [{ x: 0.3, y: 0.85 }, { x: 0.7, y: 0.85 }],
  ],

  F: [
    // spine
    [{ x: 0.3, y: 0.15 }, { x: 0.3, y: 0.85 }],
    // top bar
    [{ x: 0.3, y: 0.15 }, { x: 0.7, y: 0.15 }],
    // middle bar
    [{ x: 0.3, y: 0.5 }, { x: 0.6, y: 0.5 }],
  ],

  G: [
    // main curve
    [{ x: 0.7, y: 0.2 }, { x: 0.5, y: 0.15 }, { x: 0.3, y: 0.3 }, { x: 0.25, y: 0.5 }, { x: 0.3, y: 0.7 }, { x: 0.5, y: 0.85 }, { x: 0.7, y: 0.8 }],
    // inner bar
    [{ x: 0.55, y: 0.55 }, { x: 0.75, y: 0.55 }],
  ],

  H: [
    // left spine
    [{ x: 0.3, y: 0.15 }, { x: 0.3, y: 0.85 }],
    // right spine
    [{ x: 0.7, y: 0.15 }, { x: 0.7, y: 0.85 }],
    // crossbar
    [{ x: 0.3, y: 0.5 }, { x: 0.7, y: 0.5 }],
  ],

  I: [
    // top bar
    [{ x: 0.35, y: 0.15 }, { x: 0.65, y: 0.15 }],
    // spine
    [{ x: 0.5, y: 0.15 }, { x: 0.5, y: 0.85 }],
  ],

  J: [
    // spine
    [{ x: 0.65, y: 0.15 }, { x: 0.65, y: 0.7 }],
    // hook
    [{ x: 0.65, y: 0.7 }, { x: 0.5, y: 0.85 }, { x: 0.35, y: 0.8 }],
  ],

  K: [
    // spine
    [{ x: 0.3, y: 0.15 }, { x: 0.3, y: 0.85 }],
    // upper diagonal
    [{ x: 0.3, y: 0.5 }, { x: 0.7, y: 0.15 }],
    // lower diagonal
    [{ x: 0.3, y: 0.5 }, { x: 0.7, y: 0.85 }],
  ],

  L: [
    // spine
    [{ x: 0.3, y: 0.15 }, { x: 0.3, y: 0.85 }],
    // bottom bar
    [{ x: 0.3, y: 0.85 }, { x: 0.7, y: 0.85 }],
  ],

  M: [
    // left spine
    [{ x: 0.25, y: 0.85 }, { x: 0.25, y: 0.15 }],
    // left diagonal
    [{ x: 0.25, y: 0.15 }, { x: 0.5, y: 0.45 }],
    // right diagonal
    [{ x: 0.5, y: 0.45 }, { x: 0.75, y: 0.15 }],
    // right spine
    [{ x: 0.75, y: 0.15 }, { x: 0.75, y: 0.85 }],
  ],

  N: [
    // left spine
    [{ x: 0.25, y: 0.85 }, { x: 0.25, y: 0.15 }],
    // diagonal
    [{ x: 0.25, y: 0.15 }, { x: 0.75, y: 0.85 }],
    // right spine
    [{ x: 0.75, y: 0.85 }, { x: 0.75, y: 0.15 }],
  ],

  O: [
    [{ x: 0.5, y: 0.15 }, { x: 0.3, y: 0.25 }, { x: 0.2, y: 0.5 }, { x: 0.3, y: 0.75 }, { x: 0.5, y: 0.85 }, { x: 0.7, y: 0.75 }, { x: 0.8, y: 0.5 }, { x: 0.7, y: 0.25 }, { x: 0.5, y: 0.15 }],
  ],

  P: [
    // spine
    [{ x: 0.3, y: 0.15 }, { x: 0.3, y: 0.85 }],
    // loop
    [{ x: 0.3, y: 0.15 }, { x: 0.6, y: 0.2 }, { x: 0.65, y: 0.4 }, { x: 0.3, y: 0.45 }],
  ],

  Q: [
    // main loop
    [{ x: 0.5, y: 0.15 }, { x: 0.3, y: 0.25 }, { x: 0.2, y: 0.5 }, { x: 0.3, y: 0.75 }, { x: 0.5, y: 0.85 }, { x: 0.7, y: 0.75 }, { x: 0.8, y: 0.5 }, { x: 0.7, y: 0.25 }, { x: 0.5, y: 0.15 }],
    // tail
    [{ x: 0.6, y: 0.6 }, { x: 0.8, y: 0.85 }],
  ],

  R: [
    // spine
    [{ x: 0.3, y: 0.15 }, { x: 0.3, y: 0.85 }],
    // loop
    [{ x: 0.3, y: 0.15 }, { x: 0.6, y: 0.2 }, { x: 0.65, y: 0.4 }, { x: 0.3, y: 0.45 }],
    // leg
    [{ x: 0.35, y: 0.5 }, { x: 0.7, y: 0.85 }],
  ],

  S: [
    [{ x: 0.7, y: 0.2 }, { x: 0.4, y: 0.15 }, { x: 0.3, y: 0.3 }, { x: 0.6, y: 0.5 }, { x: 0.7, y: 0.7 }, { x: 0.4, y: 0.85 }, { x: 0.3, y: 0.7 }],
  ],

  T: [
    // top bar
    [{ x: 0.3, y: 0.15 }, { x: 0.7, y: 0.15 }],
    // spine
    [{ x: 0.5, y: 0.15 }, { x: 0.5, y: 0.85 }],
  ],

  U: [
    [{ x: 0.3, y: 0.15 }, { x: 0.3, y: 0.7 }, { x: 0.5, y: 0.85 }, { x: 0.7, y: 0.7 }, { x: 0.7, y: 0.15 }],
  ],

  V: [
    [{ x: 0.3, y: 0.15 }, { x: 0.5, y: 0.85 }, { x: 0.7, y: 0.15 }],
  ],

  W: [
    [{ x: 0.25, y: 0.15 }, { x: 0.35, y: 0.85 }, { x: 0.5, y: 0.4 }, { x: 0.65, y: 0.85 }, { x: 0.75, y: 0.15 }],
  ],

  X: [
    [{ x: 0.3, y: 0.15 }, { x: 0.7, y: 0.85 }],
    [{ x: 0.7, y: 0.15 }, { x: 0.3, y: 0.85 }],
  ],

  Y: [
    [{ x: 0.3, y: 0.15 }, { x: 0.5, y: 0.45 }, { x: 0.7, y: 0.15 }],
    [{ x: 0.5, y: 0.45 }, { x: 0.5, y: 0.85 }],
  ],

  Z: [
    [{ x: 0.3, y: 0.15 }, { x: 0.7, y: 0.15 }],
    [{ x: 0.7, y: 0.15 }, { x: 0.3, y: 0.85 }],
    [{ x: 0.3, y: 0.85 }, { x: 0.7, y: 0.85 }],
  ],

  // LOWERCASE – hybrid, multi‑stroke, simple examples

// LOWERCASE LETTERS — CLEAN HYBRID MULTI‑STROKE

  a: [
    // circle
    [{ x: 0.45, y: 0.55 }, { x: 0.35, y: 0.60 }, { x: 0.35, y: 0.70 }, { x: 0.45, y: 0.75 }, { x: 0.55, y: 0.70 }, { x: 0.55, y: 0.60 }, { x: 0.45, y: 0.55 }],
    // stem
    [{ x: 0.55, y: 0.60 }, { x: 0.55, y: 0.85 }],
  ],

  b: [
    // stem
    [{ x: 0.40, y: 0.20 }, { x: 0.40, y: 0.85 }],
    // loop
    [{ x: 0.40, y: 0.55 }, { x: 0.55, y: 0.60 }, { x: 0.55, y: 0.75 }, { x: 0.40, y: 0.80 }],
  ],

  c: [
    [{ x: 0.55, y: 0.60 }, { x: 0.45, y: 0.55 }, { x: 0.35, y: 0.65 }, { x: 0.45, y: 0.75 }, { x: 0.55, y: 0.70 }],
  ],

  d: [
    // stem
    [{ x: 0.55, y: 0.20 }, { x: 0.55, y: 0.85 }],
    // loop
    [{ x: 0.45, y: 0.55 }, { x: 0.35, y: 0.60 }, { x: 0.35, y: 0.70 }, { x: 0.45, y: 0.75 }, { x: 0.55, y: 0.70 }],
  ],

  e: [
    // crossbar
    [{ x: 0.40, y: 0.60 }, { x: 0.55, y: 0.60 }],
    // curve
    [{ x: 0.55, y: 0.60 }, { x: 0.45, y: 0.55 }, { x: 0.35, y: 0.65 }, { x: 0.45, y: 0.75 }, { x: 0.60, y: 0.70 }],
  ],

  f: [
    // stem
    [{ x: 0.50, y: 0.10 }, { x: 0.50, y: 0.85 }],
    // crossbar
    [{ x: 0.38, y: 0.40 }, { x: 0.62, y: 0.40 }],
  ],

  g: [
    // loop
    [{ x: 0.50, y: 0.55 }, { x: 0.40, y: 0.60 }, { x: 0.40, y: 0.70 }, { x: 0.50, y: 0.75 }, { x: 0.60, y: 0.70 }, { x: 0.60, y: 0.60 }, { x: 0.50, y: 0.55 }],
    // tail
    [{ x: 0.60, y: 0.70 }, { x: 0.60, y: 0.95 }],
  ],

  h: [
    // stem
    [{ x: 0.40, y: 0.20 }, { x: 0.40, y: 0.85 }],
    // hump
    [{ x: 0.40, y: 0.55 }, { x: 0.55, y: 0.60 }, { x: 0.55, y: 0.85 }],
  ],

  i: [
    // stem
    [{ x: 0.50, y: 0.45 }, { x: 0.50, y: 0.85 }],
    // dot
    [{ x: 0.50, y: 0.30 }, { x: 0.50, y: 0.30 }],
  ],

  j: [
    // stem
    [{ x: 0.55, y: 0.45 }, { x: 0.55, y: 0.85 }],
    // hook
    [{ x: 0.55, y: 0.85 }, { x: 0.45, y: 0.95 }],
    // dot
    [{ x: 0.55, y: 0.30 }, { x: 0.55, y: 0.30 }],
  ],

  k: [
    // stem
    [{ x: 0.40, y: 0.20 }, { x: 0.40, y: 0.85 }],
    // upper diagonal
    [{ x: 0.40, y: 0.55 }, { x: 0.60, y: 0.35 }],
    // lower diagonal
    [{ x: 0.40, y: 0.55 }, { x: 0.60, y: 0.75 }],
  ],

  l: [
    [{ x: 0.45, y: 0.20 }, { x: 0.45, y: 0.85 }],
  ],

  m: [
    // hump 1
    [{ x: 0.30, y: 0.55 }, { x: 0.45, y: 0.45 }, { x: 0.45, y: 0.85 }],
    // hump 2
    [{ x: 0.45, y: 0.55 }, { x: 0.60, y: 0.45 }, { x: 0.60, y: 0.85 }],
  ],

  n: [
    [{ x: 0.40, y: 0.55 }, { x: 0.55, y: 0.45 }, { x: 0.55, y: 0.85 }],
  ],

  o: [
    [{ x: 0.50, y: 0.55 }, { x: 0.40, y: 0.60 }, { x: 0.40, y: 0.70 }, { x: 0.50, y: 0.75 }, { x: 0.60, y: 0.70 }, { x: 0.60, y: 0.60 }, { x: 0.50, y: 0.55 }],
  ],

  p: [
    // stem
    [{ x: 0.40, y: 0.20 }, { x: 0.40, y: 0.85 }],
    // loop
    [{ x: 0.40, y: 0.55 }, { x: 0.55, y: 0.60 }, { x: 0.55, y: 0.75 }, { x: 0.40, y: 0.80 }],
  ],

  q: [
    // loop
    [{ x: 0.50, y: 0.55 }, { x: 0.40, y: 0.60 }, { x: 0.40, y: 0.70 }, { x: 0.50, y: 0.75 }, { x: 0.60, y: 0.70 }, { x: 0.60, y: 0.60 }, { x: 0.50, y: 0.55 }],
    // tail
    [{ x: 0.60, y: 0.75 }, { x: 0.70, y: 0.95 }],
  ],

  r: [
    [{ x: 0.40, y: 0.55 }, { x: 0.50, y: 0.45 }, { x: 0.50, y: 0.55 }],
  ],

  s: [
    [{ x: 0.60, y: 0.55 }, { x: 0.45, y: 0.50 }, { x: 0.40, y: 0.60 }, { x: 0.55, y: 0.65 }, { x: 0.60, y: 0.75 }, { x: 0.45, y: 0.80 }],
  ],

  t: [
    // stem
    [{ x: 0.50, y: 0.30 }, { x: 0.50, y: 0.85 }],
    // bar
    [{ x: 0.40, y: 0.30 }, { x: 0.60, y: 0.30 }],
  ],

  u: [
    [{ x: 0.40, y: 0.55 }, { x: 0.40, y: 0.75 }, { x: 0.50, y: 0.85 }, { x: 0.60, y: 0.75 }, { x: 0.60, y: 0.55 }],
  ],

  v: [
    [{ x: 0.40, y: 0.55 }, { x: 0.50, y: 0.85 }, { x: 0.60, y: 0.55 }],
  ],

  w: [
    [{ x: 0.35, y: 0.55 }, { x: 0.45, y: 0.85 }, { x: 0.50, y: 0.65 }, { x: 0.55, y: 0.85 }, { x: 0.65, y: 0.55 }],
  ],

  x: [
    [{ x: 0.40, y: 0.55 }, { x: 0.60, y: 0.85 }],
    [{ x: 0.60, y: 0.55 }, { x: 0.40, y: 0.85 }],
  ],

  y: [
    [{ x: 0.40, y: 0.55 }, { x: 0.50, y: 0.75 }, { x: 0.60, y: 0.55 }],
    [{ x: 0.50, y: 0.75 }, { x: 0.50, y: 0.95 }],
  ],

  z: [
    [{ x: 0.40, y: 0.55 }, { x: 0.60, y: 0.55 }],
    [{ x: 0.60, y: 0.55 }, { x: 0.40, y: 0.85 }],
    [{ x: 0.40, y: 0.85 }, { x: 0.60, y: 0.85 }],
  ],

};


const shadedLetters = new Set();

const canvas = document.getElementById("practice-canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const targetLetterEl = document.getElementById("target-letter");
const installButton = document.getElementById("install-button");
const congratsOverlay = document.getElementById("congrats-overlay");
const rewardTitle = document.getElementById("reward-title");
const rewardText = document.getElementById("reward-text");
const letterSelect = document.getElementById("letter-select");
const guideCanvas = document.createElement("canvas");
const guideCtx = guideCanvas.getContext("2d", { willReadFrequently: true });
const userCanvas = document.createElement("canvas");
const userCtx = userCanvas.getContext("2d", { willReadFrequently: true });

let currentLetterIndex = 0;
let drawing = false;
let penColor = "#1E88E5";
let currentTool = "pen";
let deferredPrompt = null;
let congratsTimeout = null;
let successAlreadyShown = false;
let strokePoints = [];
let allStrokePoints = [];
let strokeHistory = [];
let activeStroke = null;
let pendingJudgement = null;
let currentAttemptStrokes = 0;
let attemptStarted = false;

function getLetterBounds(letter) {
  const paths = guidePathsByLetter[letter] || [];
  const points = paths.flat();
  if (!points.length) {
    return { minX: 0.15, minY: 0.15, maxX: 0.85, maxY: 0.85 };
  }

  return points.reduce(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxX: Math.max(bounds.maxX, point.x),
      maxY: Math.max(bounds.maxY, point.y),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );
}

function getCurrentGuidePaths(letter) {
  const paths = guidePathsByLetter[letter] || [];
  if (!paths.length) {
    return [];
  }

  const points = paths.flat();
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));

  const originalWidth = maxX - minX;
  const originalHeight = maxY - minY;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const targetWidth = originalWidth / 12;
  const targetHeight = originalHeight / 4;

  return paths.map((path) =>
    path.map((point) => {
      const nx = (point.x - centerX) / originalWidth;
      const ny = (point.y - centerY) / originalHeight;
      return {
        x: 0.5 + nx * (targetWidth / originalWidth),
        y: 0.5 + ny * (targetHeight / originalHeight),
      };
    })
  );
}

function getGuideBufferPaths(letter) {
  const basePaths = getCurrentGuidePaths(letter);
  if (!basePaths.length) {
    return [];
  }

  const expandScale = 1.18;
  return basePaths.map((path) =>
    path.map((point) => ({
      x: 0.5 + (point.x - 0.5) * expandScale,
      y: 0.5 + (point.y - 0.5) * expandScale,
    }))
  );
}

function drawDirectionalGuideMark(ctx, width, height, path) {
  if (!path || path.length < 2) {
    return;
  }

  const start = path[0];
  const end = path[path.length - 1];
  const startX = start.x * width;
  const startY = start.y * height;
  const endX = end.x * width;
  const endY = end.y * height;

  const arrowLength = 14;
  const angle = Math.atan2(endY - startY, endX - startX);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.strokeStyle = "rgba(40, 140, 70, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  ctx.fillStyle = "#2ecc71";
  ctx.beginPath();
  ctx.arc(startX, startY, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff4d4f";
  ctx.beginPath();
  ctx.arc(endX, endY, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ff4d4f";
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - arrowLength * Math.cos(angle - Math.PI / 7), endY - arrowLength * Math.sin(angle - Math.PI / 7));
  ctx.lineTo(endX - arrowLength * Math.cos(angle + Math.PI / 7), endY - arrowLength * Math.sin(angle + Math.PI / 7));
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const projection = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy);
  const clampedT = Math.min(1, Math.max(0, projection));
  const closestX = start.x + clampedT * dx;
  const closestY = start.y + clampedT * dy;
  return Math.hypot(point.x - closestX, point.y - closestY);
}

function isPointNearGuide(point, letter, buffer = 0.11) {
  const paths = getCurrentGuidePaths(letter);
  for (const path of paths) {
    for (let i = 0; i < path.length - 1; i += 1) {
      if (distanceToSegment(point, path[i], path[i + 1]) <= buffer) {
        return true;
      }
    }
  }
  return false;
}

function nearestDistanceToGuide(point, letter) {
  const paths = getCurrentGuidePaths(letter);
  let nearest = Infinity;

  for (const path of paths) {
    for (let i = 0; i < path.length - 1; i += 1) {
      nearest = Math.min(nearest, distanceToSegment(point, path[i], path[i + 1]));
    }
  }

  return Number.isFinite(nearest) ? nearest : Infinity;
}

function getGuideSamples(letter) {
  const paths = getCurrentGuidePaths(letter);
  const samples = [];

  paths.forEach((path) => {
    for (let i = 0; i < path.length - 1; i += 1) {
      const start = path[i];
      const end = path[i + 1];
      const steps = Math.max(4, Math.ceil(Math.hypot(end.x - start.x, end.y - start.y) / 0.05));
      for (let step = 0; step <= steps; step += 1) {
        const t = step / steps;
        samples.push({
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t,
        });
      }
    }
  });

  return samples;
}

function getPathAnchors(letter) {
  const paths = getCurrentGuidePaths(letter);
  return paths.flatMap((path) => [path[0], path[path.length - 1]]);
}

async function resetStaleServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
}

function updateTargetLetter() {
  const letter = letters[currentLetterIndex];
  targetLetterEl.textContent = letter + letter.toLowerCase();
  // Uppercase centered
  drawGuide(letter.toUpperCase(), 0, 0);

  // Lowercase shifted right by 0.15 (15% of canvas width)
  drawGuide(letter.toLowerCase(), 0.15, 0);
}

function drawGuide(letter, offsetX = 0, offsetY = 0) {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.clientWidth || canvas.width;
  const height = rect.height || canvas.clientHeight || canvas.height;

  guideCanvas.width = canvas.width;
  guideCanvas.height = canvas.height;
  guideCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);


  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(90, 150, 210, 0.28)";
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(26, height * 0.72);
  ctx.lineTo(width - 26, height * 0.72);
  ctx.stroke();
  ctx.setLineDash([]);

  const paths = getCurrentGuidePaths(letter);
  const bufferPaths = getGuideBufferPaths(letter);
  if (paths && paths.length) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    bufferPaths.forEach((path) => {
      ctx.beginPath();
      ctx.lineWidth = shadedLetters.has(letter) ? 8 : 6.5;
      ctx.strokeStyle = "rgba(64, 134, 224, 0.12)";
      path.forEach((point, index) => {
        const x = (point.x + offsetX) * width;
        const y = (point.y + offsetY) * height;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    });

    paths.forEach((path) => {
      ctx.beginPath();
      const trackThickness = shadedLetters.has(letter) ? 20 : 14;
      ctx.lineWidth = trackThickness;
      ctx.strokeStyle = "rgba(64, 134, 224, 0.9)";
      path.forEach((point, index) => {
        const x = (point.x + offsetX) * width;
        const y = (point.y + offsetY) * height;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      drawDirectionalGuideMark(ctx, width, height, path);
    });
    return;
  }

  ctx.fillStyle = "rgba(97, 157, 232, 0.12)";
  ctx.font = `bold ${Math.min(width, height) * 0.5}px "Arial Rounded MT Bold", "Comic Sans MS", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, width / 2, height / 2 + 10);

  guideCtx.fillStyle = "rgba(97, 157, 232, 0.9)";
  guideCtx.font = `bold ${Math.min(width, height) * 0.5}px "Arial Rounded MT Bold", "Comic Sans MS", sans-serif`;
  guideCtx.textAlign = "center";
  guideCtx.textBaseline = "middle";
  guideCtx.fillText(letter, width / 2, height / 2 + 10);
}

function selectLetter(letter) {
  const index = letters.indexOf(letter);
  if (index === -1) {
    return;
  }

  currentLetterIndex = index;
  letterSelect.value = letter;
  clearCanvas();
  updateTargetLetter();
}

function getPointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  userCanvas.width = canvas.width;
  userCanvas.height = canvas.height;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 2.5;

  userCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
  userCtx.lineCap = "round";
  userCtx.lineJoin = "round";
  userCtx.lineWidth = 2.5;

  drawGuide(letters[currentLetterIndex]);
}

function startDrawing(event) {
  drawing = true;
  strokePoints = [];

  if (currentTool === "pen") {
    if (pendingJudgement) {
      clearTimeout(pendingJudgement);
      pendingJudgement = null;
    }
    attemptStarted = true;
    currentAttemptStrokes += 1;
    activeStroke = { points: [] };
  }

  const point = getPointerPosition(event);
  strokePoints.push(point);
  if (activeStroke) {
    activeStroke.points.push(point);
  }

  ctx.beginPath();
  ctx.lineWidth = currentTool === "eraser" ? 12 : 2.5;
  ctx.moveTo(point.x, point.y);
  ctx.lineTo(point.x, point.y);
  ctx.strokeStyle = currentTool === "eraser" ? "rgba(255,255,255,1)" : penColor;
  ctx.globalCompositeOperation = currentTool === "eraser" ? "destination-out" : "source-over";
  ctx.stroke();

  userCtx.beginPath();
  userCtx.lineWidth = currentTool === "eraser" ? 12 : 2.5;
  userCtx.moveTo(point.x, point.y);
  userCtx.lineTo(point.x, point.y);
  userCtx.strokeStyle = currentTool === "eraser" ? "rgba(255,255,255,1)" : penColor;
  userCtx.globalCompositeOperation = currentTool === "eraser" ? "destination-out" : "source-over";
  userCtx.stroke();
}

function draw(event) {
  if (!drawing) {
    return;
  }

  const point = getPointerPosition(event);
  strokePoints.push(point);
  if (activeStroke) {
    activeStroke.points.push(point);
  }

  ctx.lineWidth = currentTool === "eraser" ? 12 : 2.5;
  ctx.lineTo(point.x, point.y);
  ctx.strokeStyle = currentTool === "eraser" ? "rgba(255,255,255,1)" : penColor;
  ctx.globalCompositeOperation = currentTool === "eraser" ? "destination-out" : "source-over";
  ctx.stroke();

  userCtx.lineWidth = currentTool === "eraser" ? 12 : 2.5;
  userCtx.lineTo(point.x, point.y);
  userCtx.strokeStyle = currentTool === "eraser" ? "rgba(255,255,255,1)" : penColor;
  userCtx.globalCompositeOperation = currentTool === "eraser" ? "destination-out" : "source-over";
  userCtx.stroke();

  if (currentTool === "pen" && pendingJudgement) {
    clearTimeout(pendingJudgement);
    pendingJudgement = null;
  }
}

function scheduleJudgement() {
  if (!attemptStarted || currentAttemptStrokes === 0) {
    return;
  }

  if (pendingJudgement) {
    clearTimeout(pendingJudgement);
  }

  pendingJudgement = setTimeout(() => {
    if (currentTool === "pen" && !successAlreadyShown) {
      const result = evaluateAttempt();
      if (result.state === "success") {
        showFeedback("success");
      } else if (result.state === "failure") {
        showFeedback("failure");
      }
    }
    pendingJudgement = null;
  }, 2500);
}

function stopDrawing() {
  drawing = false;
  ctx.beginPath();
  ctx.globalCompositeOperation = "source-over";

  if (currentTool === "pen") {
    allStrokePoints.push(...strokePoints);
    if (activeStroke) {
      strokeHistory.push(activeStroke);
      activeStroke = null;
    }
    scheduleJudgement();
  }

  strokePoints = [];
}

function evaluateAttempt() {
  if (!attemptStarted || currentAttemptStrokes === 0) {
    return { state: "neutral", score: 0, isSuccess: false, shouldRetry: false };
  }

  const letter = letters[currentLetterIndex];
  const paths = guidePathsByLetter[letter] || [];
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.clientWidth || canvas.width;
  const height = rect.height || canvas.clientHeight || canvas.height;

  const normalizedPoints = allStrokePoints.map((point) => ({
    x: point.x / width,
    y: point.y / height,
  }));

  if (!normalizedPoints.length) {
    return { state: "failure", score: 0, isSuccess: false, shouldRetry: true };
  }

  const guideSamples = getGuideSamples(letter);
  const matchBuffer = 0.12;
  const distances = normalizedPoints.map((point) => nearestDistanceToGuide(point, letter));
  const closePoints = distances.filter((distance) => distance <= matchBuffer).length;
  const averageDistance = distances.reduce((sum, distance) => sum + distance, 0) / distances.length;
  const maxDistance = Math.max(...distances);
  const matchedRatio = closePoints / normalizedPoints.length;
  const coveredGuideSamples = guideSamples.filter((sample) =>
    normalizedPoints.some((point) => Math.hypot(point.x - sample.x, point.y - sample.y) <= matchBuffer)
  ).length;
  const guideCoverage = guideSamples.length ? coveredGuideSamples / guideSamples.length : 0;

  const expectedMinStrokes = requiredStrokesByLetter[letter] || 1;
  const hasValidStrokeCount = currentAttemptStrokes >= expectedMinStrokes || currentAttemptStrokes >= 1;

  const isMeaningfulTrace = matchedRatio >= 0.7 && guideCoverage >= 0.55 && averageDistance <= 0.12 && maxDistance <= 0.25 && hasValidStrokeCount;
  const isTooMuchScribble = matchedRatio < 0.45 || guideCoverage < 0.35 || averageDistance > 0.18 || maxDistance > 0.3;

  if (paths.length && isMeaningfulTrace && !isTooMuchScribble) {
    return { state: "success", score: 1, isSuccess: true, shouldRetry: false };
  }

  return { state: "failure", score: 0, isSuccess: false, shouldRetry: true };
}

function showFeedback(type) {
  successAlreadyShown = true;
  congratsOverlay.classList.remove("hidden");
  congratsOverlay.classList.remove("failure");

  if (type === "failure") {
    congratsOverlay.classList.add("failure");
    rewardTitle.textContent = "Try Again";
    rewardText.textContent = "Trace the letter again and stay on the guide line.";
  } else {
    rewardTitle.textContent = "Great Job!";
    rewardText.textContent = "You traced it perfectly!";
  }

  congratsOverlay.classList.add("visible");

  if (congratsTimeout) {
    clearTimeout(congratsTimeout);
  }

  congratsTimeout = setTimeout(() => {
    congratsOverlay.classList.remove("visible");
    setTimeout(() => {
      congratsOverlay.classList.add("hidden");
      successAlreadyShown = false;

      if (type === "success") {
        nextLetter();
      } else {
        clearCanvas();
      }
    }, 280);
  }, 1600);
}

function checkAnswer() {
  if (pendingJudgement) {
    clearTimeout(pendingJudgement);
    pendingJudgement = null;
  }

  if (!attemptStarted || currentAttemptStrokes === 0) {
    showFeedback("failure");
    return;
  }

  const result = evaluateAttempt();
  if (result.state === "success") {
    showFeedback("success");
  } else {
    showFeedback("failure");
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  userCtx.clearRect(0, 0, userCanvas.width, userCanvas.height);
  drawGuide(letters[currentLetterIndex]);
  successAlreadyShown = false;
  strokePoints = [];
  allStrokePoints = [];
  strokeHistory = [];
  activeStroke = null;
  currentAttemptStrokes = 0;
  attemptStarted = false;
  if (pendingJudgement) {
    clearTimeout(pendingJudgement);
    pendingJudgement = null;
  }
}

function nextLetter() {
  currentLetterIndex = (currentLetterIndex + 1) % letters.length;
  clearCanvas();
  updateTargetLetter();
}

function setTool(toolName) {
  currentTool = toolName;
  document.querySelectorAll(".tool-button[data-tool]").forEach((button) => {
    button.classList.toggle("primary", button.dataset.tool === toolName);
  });
}

function setColor(color) {
  penColor = color;
  document.querySelectorAll(".swatch").forEach((button) => {
    button.classList.toggle("active", button.dataset.color === color);
  });
}

canvas.addEventListener("pointerdown", startDrawing);
canvas.addEventListener("pointermove", draw);
canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointerleave", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);

window.addEventListener("resize", resizeCanvas);

document.querySelector("[data-action='clear']").addEventListener("click", clearCanvas);
document.querySelector("[data-action='check']").addEventListener("click", checkAnswer);
document.querySelector("[data-action='next']").addEventListener("click", nextLetter);
letterSelect.addEventListener("change", (event) => {
  selectLetter(event.target.value);
});
document.querySelectorAll("[data-tool]").forEach((button) => {
  button.addEventListener("click", () => setTool(button.dataset.tool));
});
document.querySelectorAll(".swatch").forEach((button) => {
  button.addEventListener("click", () => setColor(button.dataset.color));
});

resetStaleServiceWorker();

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installButton.classList.remove("hidden");
});

installButton.addEventListener("click", async () => {
  if (!deferredPrompt) {
    return;
  }

  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installButton.classList.add("hidden");
});

window.addEventListener("appinstalled", () => {
  installButton.classList.add("hidden");
});

resizeCanvas();
letterSelect.value = letters[currentLetterIndex];
updateTargetLetter();
setTool("pen");
setColor("#1E88E5");
