# 3d-internet-app

This repository holds two independent projects:

| Project | Folder | What it is |
|---------|--------|------------|
| **3D network visualization** | repo root (`src/`) | Interactive web app (React + Three.js) that follows one HTTP request from a laptop, through a router and fibre optic cables, to a server |
| **Claymation video** | `claymation/` | 20-second stop-motion style animation (Remotion + Three.js), already rendered as `claude-claymation.mp4` |

Each project has its own `package.json` and `node_modules`, so install them separately.

**Requirements:** Node.js 18 or newer (20+ recommended) and npm.

---

## 1. 3D network visualization app

### Launch it

From the repository root:

```bash
npm install
npm run dev
```

Then open **http://localhost:5173** in a browser with WebGL support (any recent Chrome, Edge, Firefox or Safari).

Other commands:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build at http://localhost:4173
```

The contents of `dist/` are static files, so they can be hosted on any static web host (GitHub Pages, Netlify, a university web server, etc.).

### Using it

The app walks through four stations: **Laptop → Router → Fibre optics → Server**. Each one has a side panel explaining what happens there and how the packet header (IP addresses, TTL, medium) changes.

- **Timeline** (bottom): click a station, use ‹ › to step, or ▶ to play the tour automatically
- **Keyboard:** `←` `→` step · `1`–`4` jump to a station · `Space` play/pause · `O` overview
- **Mouse:** click a 3D object or its floating label to fly to it

Pulse colours: cyan = request, amber = response, pale blue = electrical signal on copper, magenta = a second fibre wavelength.

### Where things are

```
src/
  App.jsx          state, autoplay, keyboard shortcuts
  stations.js      camera positions + teaching text for each station  ← edit content here
  paths.js         cable routes shared by cables, pulses and packet
  scene/           3D models, camera, cables, packet animation
  ui/              timeline and info panel
```

---

## 2. Claymation video (Remotion)

The finished video is already in the repo root: **`claude-claymation.mp4`** (1920×1080, 12 fps, 240 frames, 20 s). You only need the steps below to preview or change it.

All commands run inside the `claymation/` folder:

```bash
cd claymation
npm install
```

### Preview in Remotion Studio

```bash
npm run studio
```

This opens Remotion Studio in your browser (usually http://localhost:3000). Choose the **ClayMath** composition, then scrub the timeline or press play. Edits to files in `claymation/src/` show up live.

### Render the video

```bash
npm run render
```

This writes `claude-claymation.mp4` to the repository root, replacing the existing file. It takes a few minutes, depending on your CPU.

Under the hood this runs:

```bash
npx remotion render src/index.jsx ClayMath ../claude-claymation.mp4 --gl=swangle
```

- `--gl=swangle` gives the headless browser software WebGL, which the 3D scene needs.
- The first render downloads Remotion's headless Chrome. If your network blocks that download, point Remotion at an existing Chrome/Chromium headless shell by adding `--browser-executable=/path/to/headless-shell` to the command.
- To check a single frame quickly, render a still instead:
  `npx remotion still src/index.jsx ClayMath frame.png --frame=120 --gl=swangle`

### Story timeline

| Time | Frames | What happens |
|------|--------|--------------|
| 0–3 s | 0–36 | The clay starburst wakes up |
| 3–8 s | 36–96 | It inspects messy clay numbers |
| 8–14 s | 96–168 | The numbers organise into `3 + 4 = 7` with glowing blue blocks |
| 14–17 s | 168–204 | It peers through a magnifying glass |
| 17–20 s | 204–240 | Logo lockup |

Beat timings live in `claymation/src/timeline.js`. See `claymation/README.md` for more on how the scene is built.

> The starburst character and "Claude" lettering are hand-modelled stand-ins, not official Anthropic brand assets. Check Anthropic's brand guidelines before publishing the video.

---

## Troubleshooting

- **Blank or black 3D canvas:** make sure hardware acceleration / WebGL is enabled in your browser.
- **Port 5173 already in use:** Vite will pick the next free port; check the terminal output for the URL.
- **`npm install` errors about peer dependencies:** check your Node.js version with `node -v` (18+ required).
