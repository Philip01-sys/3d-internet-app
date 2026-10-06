import { Easing, interpolate, random } from 'remotion'

export const FPS = 12
export const DURATION = 20 * FPS // 240 frames

/** Seconds -> frame number at 12 fps. */
export const s = (seconds) => Math.round(seconds * FPS)

// Story beats (frames).
export const BEATS = {
  awake: [s(0), s(3)], //       0–36   character wakes up
  inspect: [s(3), s(8)], //    36–96   pokes at the messy clay numbers
  organize: [s(8), s(14)], //  96–168  numbers sort into glowing blue blocks
  magnify: [s(14), s(17)], // 168–204  peers through a magnifying glass
  lockup: [s(17), s(20)], //  204–240  logo lockup
}

const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }

/** Clamped interpolate over keyframes, with optional easing. */
export const key = (frame, frames, values, easing = Easing.inOut(Easing.cubic)) =>
  interpolate(frame, frames, values, { ...clampOpts, easing })

/** 0..1 progress between frames a and b. */
export const prog = (frame, a, b, easing = Easing.inOut(Easing.cubic)) =>
  interpolate(frame, [a, b], [0, 1], { ...clampOpts, easing })

/**
 * Stop-motion "boil": a tiny deterministic per-frame wobble, as if every
 * object were nudged by hand between exposures.
 */
export const boil = (frame, seed, amount) => (random(`${seed}:${frame}`) * 2 - 1) * amount

/** Overshooting pop from 0 to 1 starting at frame `at`, lasting `len` frames. */
export const pop = (frame, at, len = 5) => {
  const t = Math.min(Math.max((frame - at) / len, 0), 1)
  return t === 0 ? 0 : Easing.out(Easing.back(2.2))(t)
}
