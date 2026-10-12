# Little Letter Practice

A kid-friendly handwriting practice app for iPad and desktop browsers. Children trace letters with numbered stroke-order guides, practice writing on their own in blank boxes, and learn picture words. Works with a finger, mouse or Apple Pencil and can be installed like a native app from Safari.

**▶ Play online for free: https://thereven3947.github.io/kids_handwriting_ipad/**

No sign-up, no ads and no data leaves the device – everything runs in the browser.

## Features

- **Letters** (A–Z with lowercase) and **Words**: 141 picture words in 8 groups –
  animals, food, things, on the go, nature, body & people, colors and little words
  (for example 🐱 cat, 🍕 pizza, 🚀 rocket, 🔴 red)
- Three practice modes:
  - **Trace** – numbered stroke-order tracks (1, 2, 3 …) with direction arrows
  - **Trace + Write** – trace on top, then write the same letters in blank boxes below
  - **Write** – blank boxes only, no tracks
- Every word has an emoji picture, a short sentence and a 🔊 button that reads it aloud,
  plus a "Spell it" button (C, A, T… cat)
- Letter sounds (phonics): each letter has buttons for the name and every sound it makes,
  with a picture word and the sound's letters highlighted – e.g. A: 🍎 **a**pple ("app,
  app, apple"), 🎂 c**a**ke ("A"), ⌚ w**a**tch ("ah"), 🛋️ sof**a** ("uh"); vowels and
  C, G, S, Y have more than one sound
- Forgiving judging with a buffer zone (see below), stars for good work, and per-letter
  feedback: correct letters keep a green check, only the ones to redo are cleared
- Responsive layout: sidebar + big board on iPad landscape and desktop, stacked on iPad
  portrait and phones; ink stays in place when the iPad rotates
- Apple Pencil palm rejection, pencil/eraser tools, colors
- "For grown-ups" panel: show the judging zone, turn auto-check on/off, pick the voice
  and test the sound
- Remembers the last letter/word, mode and settings
- Installable as a web app on iPad via Home Screen

## How drawings are judged

Each letter box is judged on its own (`scoring.js`):

- **Trace boxes** use a judging buffer around the track (16% of the letter height on each
  side, shown in green when "Show the judging zone" is on). A letter counts when
  - at least **50 %** of the ink is inside the buffer,
  - at least **60 %** of the track is covered, and
  - the shape generally looks like the letter (a point-cloud shape match; stroke order and
    direction do not matter).
- **Write boxes** have no track, so only the shape is compared – size, position and small
  tilts do not matter, but the letter must not be tiny.

The thresholds were tuned with simulated wobbly "child" handwriting (`tests/simulate.js`):
typical tracing passes for every letter, messy tracing still passes ~94 % of the time,
and drawing a different letter is rejected (only near look-alikes such as *c*/*s* can slip by).

## Adding words

Add a line to the right group in `vocabulary.js`:

```js
["duck", "🦆", "The duck says quack."],
```

Words must be 2–6 lowercase letters. Use emoji that iPadOS 15 can show (Emoji 13 or older)
so the picture appears on older iPads. Run the tests afterwards – they check that every
word fits on phone, iPad and desktop screens.

## Sound

Speech uses the device's built-in voices (Web Speech API), so it works offline and needs
no audio files. The app picks an English voice installed on the device (for example
Samantha on iPad, Zira on Windows), even if the device's default voice is another
language; online voices such as Chrome's "Google US English" can still be chosen under
"For grown-ups". Voices spell out strings they don't know letter by letter, so letter
sounds only use real words, letter names and common sounds ("ah", "eh", "uh", "buh"…).
Long vowels say their name ("A, A, cake"); short a and short i use the classic chant
"app, app, apple" and "in, in, insect".

All parts are spoken in one go, each as its own short sentence – "App! App! Apple!"
(`speech.js`). Measured with Windows voices, this gives every part the same pitch and
loudness with an even pause in between. Commas ("app, app, apple") make the voice add
sentence melody (soft start, loud middle, fading end), and speaking the parts separately
makes the audio stop and restart between them, which many speakers clip.

If you hear nothing:

- open "For grown-ups" → **Test sound**; the button pulses while it is speaking
- check the device volume (on iPad also the silent switch / Control Center)
- choose another voice in the **Voice** list
- some embedded browsers (such as the browser inside VS Code) may not play speech –
  open `http://localhost:8000` in Safari, Chrome or Edge instead

## Links for specific practice

Add options to the address, e.g.

- `?letter=B&mode=write`
- `?word=cat&mode=both`
- `?zone=1` to show the judging zone

## Requirements

- iPad running iPadOS 15 or later with Safari, or any modern desktop browser
- Internet connection for the first loading of the app (optional after installation)

## Installation on iPad

1. Open https://thereven3947.github.io/kids_handwriting_ipad/ in Safari.
2. Tap the Share button.
3. Choose Add to Home Screen.
4. Confirm the name and tap Add.
5. The app will appear on the Home Screen and can be opened like a normal app.

## Hosting

The site is a plain static web app hosted for free on **GitHub Pages** from the `master`
branch (repository root). Every push to `master` updates the website within a minute or two.
It also works on any other static host (Netlify, Cloudflare Pages, …) – just upload the files.

## Run locally on a computer

From the project folder:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Files

- `index.html` – main app screen
- `styles.css` – responsive, child-friendly layout and styling
- `guides.js` – letter stroke tracks (A–Z, a–z), sheet layout and guide drawing
- `scoring.js` – buffer-zone and shape judging
- `vocabulary.js` – picture words, grouped by topic
- `phonics.js` – letter sounds with picture words
- `speech.js` – picks an English voice and plays speech reliably
- `app.js` – drawing, modes and app behavior
- `manifest.webmanifest` – app installation metadata
- `sw.js` – offline cache support
- `tests/guides.test.js` – checks every letter track and the sheet layouts
- `tests/scoring.test.js` – checks the judging (lenient for real tracing, rejects wrong letters) and the word list
- `tests/phonics.test.js` – checks the letter sounds
- `tests/simulate.js` – simulated child handwriting used by the tests
- `tests/gallery.html` – visual gallery of all letter guides

## Letter guides

Each letter in `guides.js` is built from lines and arcs on handwriting-paper
units (`0` = top line, `0.5` = midline, `1` = baseline, `1.4` = descender line).
Strokes are listed in teaching order (Zaner-Bloser style) and run in the
direction they should be written; the app numbers them automatically.

## Testing

```bash
node --test "tests/*.test.js"
```

The tests check every letter's track (stroke count, position on the guide
lines, top-down/left-to-right stroke starts, connected shapes), that every
sheet fits on phone, iPad and desktop sizes, and simulate children's tracing and
writing: wobbly but correct drawings pass, while other letters, half-finished
letters, tiny letters and scribbles fail.

To eyeball all guides at once, start the local server and open
`http://localhost:8000/tests/gallery.html`.

## Notes

This is a lightweight PWA (Progressive Web App). It works best when served via HTTPS or localhost. On iPad, the install flow is usually done in Safari, not the App Store.
