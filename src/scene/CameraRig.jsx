import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import { OVERVIEW, TRAVEL_SECONDS } from '../stations.js'

const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

/**
 * Flies the camera between poses with an eased, slightly arcing path, then
 * adds gentle mouse parallax so the scene feels alive while resting.
 */
export default function CameraRig({ pose }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const s = useMemo(
    () => ({
      pos: new Vector3(...OVERVIEW.position),
      target: new Vector3(...OVERVIEW.target),
      fromPos: new Vector3(),
      fromTarget: new Vector3(),
      toPos: new Vector3(),
      toTarget: new Vector3(),
      arc: 0,
      start: null,
    }),
    [],
  )
  const parallax = useRef({ x: 0, y: 0 })

  // Shift the projection centre away from the info panel (right side on
  // desktop, bottom on phones) so the focused object stays unobstructed.
  useEffect(() => {
    const { width: w, height: h } = size
    const wide = w > 760
    camera.setViewOffset(w, h, wide ? Math.min(200, w * 0.14) : 0, wide ? 0 : h * 0.14, w, h)
    camera.updateProjectionMatrix()
  }, [camera, size])

  useEffect(() => {
    s.fromPos.copy(s.pos)
    s.fromTarget.copy(s.target)
    s.toPos.set(...pose.position)
    s.toTarget.set(...pose.target)
    s.arc = Math.min(s.fromPos.distanceTo(s.toPos) * 0.18, 4)
    s.start = null
  }, [pose, s])

  useFrame(({ clock, pointer }, dt) => {
    const t = clock.elapsedTime
    if (s.start === null) s.start = t
    const k = Math.min((t - s.start) / TRAVEL_SECONDS, 1)
    const e = easeInOutCubic(k)
    s.pos.lerpVectors(s.fromPos, s.toPos, e)
    s.pos.y += Math.sin(Math.PI * k) * s.arc
    s.target.lerpVectors(s.fromTarget, s.toTarget, e)

    const damp = 1 - Math.exp(-3 * dt)
    parallax.current.x = MathUtils.lerp(parallax.current.x, pointer.x, damp)
    parallax.current.y = MathUtils.lerp(parallax.current.y, pointer.y, damp)

    // Portrait screens see less horizontally, so pull the camera back.
    const pullBack = MathUtils.clamp(1.15 / (size.width / size.height), 1, 2.1)
    camera.position
      .subVectors(s.pos, s.target)
      .multiplyScalar(pullBack)
      .add(s.target)
    camera.position.x += parallax.current.x * 0.6
    camera.position.y += parallax.current.y * 0.35
    camera.lookAt(s.target)
  })

  return null
}
