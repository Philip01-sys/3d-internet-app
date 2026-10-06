import { Composition } from 'remotion'
import { ClayMath } from './ClayMath.jsx'
import { DURATION, FPS } from './timeline.js'

export const Root = () => (
  <Composition
    id="ClayMath"
    component={ClayMath}
    durationInFrames={DURATION}
    fps={FPS}
    width={1920}
    height={1080}
  />
)
