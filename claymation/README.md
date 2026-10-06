# Claude claymation (Remotion)

A 20-second stop-motion style animation — 12 fps, 240 frames, 1920×1080 —
rendered with [Remotion](https://www.remotion.dev) and Three.js. The output is
`../claude-claymation.mp4`.

| Time | Frames | Beat |
|------|--------|------|
| 0–3 s | 0–36 | Terracotta starburst character wakes up (Zzz, blink, yawn, stretch hop) |
| 3–8 s | 36–96 | Inspects messy clay numbers, pokes the 4 and the 3 |
| 8–14 s | 96–168 | Numbers hop into `3 + 4 = 7`, get glowing blue blocks; 3 + 4 unit cubes slide into 7 |
| 14–17 s | 168–204 | Peers through a magnifying glass (eye magnified) |
| 17–20 s | 204–240 | Logo lockup: character + "Claude" in clay letters |

Everything is procedural: rays, digits and letters are rolled clay "coils"
(tube geometry with a fingerprint bump map), and a per-frame deterministic
jitter ("boil") gives the hand-animated stop-motion feel.

```bash
npm install
npm run studio   # preview in Remotion Studio
npm run render   # writes ../claude-claymation.mp4
```

The scene uses WebGL, so rendering needs `--gl=swangle` (already in the
script). If Remotion can't download its Chrome Headless Shell (e.g. behind a
firewall), add `--browser-executable=/path/to/chrome-headless-shell`.

Source layout: `src/timeline.js` (beats and easing helpers), `src/ClayMath.jsx`
(scene, camera moves, lights, lockup), `src/Starburst.jsx` (character),
`src/MathBlocks.jsx` (numbers and blue blocks), `src/ClayGlyph.jsx` (clay
letters), `src/clay.js` (materials and textures).
