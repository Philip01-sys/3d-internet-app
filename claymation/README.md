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

## Sound

The soundtrack (`src/Soundtrack.jsx`) layers these sounds with `<Audio>` from `@remotion/media`:

| Sound | When |
|-------|------|
| Rubbery stretch + breathy yawn | frame 20, as the character wakes |
| Playful pops (3 pitches) | each time a clay number hops into the equation |
| Whoosh | as each glowing blue block appears |
| Low hum | under the blue blocks (frames 128–212), swelling when 3 + 4 = 7 lands |
| Acoustic guitar | background music, with volume keyframed to the story |

Every sound is synthesized from scratch by `scripts/make_audio.py` (plucked-string
synthesis for the guitar, filtered noise and oscillators for the effects), so
there are no third-party samples or licences involved. The generated files are
committed in `public/sfx/`; to tweak a sound, edit the script and run:

```bash
python3 scripts/make_audio.py   # needs numpy; rewrites public/sfx/*.wav
```

Sound timings come from the same constants as the animation (`HOP_AT`,
`BLOCK_AT` in `src/MathBlocks.jsx`), so retiming a hop moves its pop too.

## Running

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
