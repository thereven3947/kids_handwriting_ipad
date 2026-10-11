# Little Letter Practice

A simple kid-friendly handwriting practice app designed for an iPad Air. It lets children trace letters using a finger or stylus and can be installed like a native app from Safari.

## Features

- Large handwriting area for easy finger tracing
- Guided letter prompt
- Pencil and eraser tools
- Color choices
- Clear and next-letter controls
- Installable as a web app on iPad via Home Screen

## Requirements

- iPad Air running iPadOS 15 or later
- Safari browser
- Internet connection for the first loading of the app (optional after installation)

## Installation on iPad Air

1. Open the project folder in a local web server or in a browser on the iPad.
2. Open the app in Safari.
3. Tap the Share button in Safari.
4. Choose Add to Home Screen.
5. Confirm the name and tap Add.
6. The app will appear on the Home Screen and can be opened like a normal app.

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
- `styles.css` – child-friendly layout and styling
- `app.js` – drawing logic and app behavior
- `manifest.webmanifest` – app installation metadata
- `sw.js` – offline cache support

## Notes

This is a lightweight PWA (Progressive Web App). It works best when served via HTTPS or localhost. On iPad, the install flow is usually done in Safari, not the App Store.
