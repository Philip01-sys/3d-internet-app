import { Audio } from '@remotion/media'
import { interpolate, staticFile } from 'remotion'
import { BLOCK_AT, HOP_AT } from './MathBlocks.jsx'

// All sounds are synthesized by scripts/make_audio.py into public/sfx/.
const sfx = (name) => staticFile(`sfx/${name}.wav`)
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }

const YAWN_AT = 20 // stretch begins (see Starburst.jsx), yawn peaks ~frame 26
const HUM_FROM = 128 // just before the first blue block pops in
const HUM_TO = 212 // blocks finish clearing for the lockup
const ANSWER_AT = 160 // unit cubes land and the "7" block flashes

/** Background music level over the whole film, keyed by composition frame. */
const musicVolume = (f) =>
  interpolate(
    f,
    [0, 12, 36, 120, 132, 196, 208, 228, 240],
    [0, 0.16, 0.3, 0.3, 0.22, 0.22, 0.38, 0.38, 0],
    clamp,
  )

/** Hum level: fade in under the blocks, swell on the answer, fade out. */
const humVolume = (m) =>
  interpolate(
    m + HUM_FROM,
    [HUM_FROM, HUM_FROM + 8, ANSWER_AT, ANSWER_AT + 3, ANSWER_AT + 12, HUM_TO - 10, HUM_TO],
    [0, 0.32, 0.32, 0.55, 0.32, 0.32, 0],
    clamp,
  )

export function Soundtrack() {
  return (
    <>
      <Audio name="Music" src={sfx('music')} volume={musicVolume} />

      <Audio name="Stretch + yawn" src={sfx('stretch')} from={YAWN_AT} volume={0.75} />

      {HOP_AT.map((at, i) => (
        <Audio key={`pop${i}`} name={`Pop ${i + 1}`} src={sfx(`pop-${(i % 3) + 1}`)} from={at} volume={0.6} />
      ))}

      {BLOCK_AT.filter((at) => at !== null).map((at, i) => (
        <Audio key={`whoosh${i}`} name={`Whoosh ${i + 1}`} src={sfx('whoosh')} from={at - 2} volume={0.45} />
      ))}
      <Audio name="Glow hum" src={sfx('hum')} from={HUM_FROM} durationInFrames={HUM_TO - HUM_FROM} volume={humVolume} />
    </>
  )
}
