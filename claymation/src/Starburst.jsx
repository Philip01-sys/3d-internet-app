import { useMemo } from 'react'
import { useCurrentFrame } from 'remotion'
import { CapsuleGeometry, CylinderGeometry, LatheGeometry, SphereGeometry, TorusGeometry, Vector2 } from 'three'
import { INK, TERRACOTTA, clay, lumpify } from './clay.js'
import { ClayGlyph } from './ClayGlyph.jsx'
import { boil, key, prog } from './timeline.js'

// Twelve irregular rays, like a hand-rolled version of the starburst mark.
const RAYS = [
  [92, 0.95, 0.13],
  [60, 0.8, 0.12],
  [28, 0.98, 0.135],
  [-2, 0.85, 0.12],
  [-34, 0.9, 0.13], // index 4: the "arm" that holds the magnifying glass
  [-64, 0.82, 0.125],
  [-96, 0.92, 0.135],
  [-124, 0.8, 0.12],
  [-152, 0.97, 0.13],
  [178, 0.84, 0.125],
  [148, 0.93, 0.13],
  [120, 0.78, 0.12],
]
const ARM = 4
const RAY_START = 0.18
const TIP = 0.075
export const BODY_Y = 1.17 // centre height, so the bottom ray rests on the desk

/** A tapered clay ray: thick where it joins the body, rounded at the tip. */
function rayGeometry(len, base, seed) {
  const pts = [new Vector2(0.001, -0.05), new Vector2(base, 0)]
  for (let i = 1; i <= 10; i++) {
    const t = i / 10
    pts.push(new Vector2(base + (TIP - base) * Math.pow(t, 0.85), len * t))
  }
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2)
    pts.push(new Vector2(Math.max(TIP * Math.cos(a), 0.001), len + TIP * Math.sin(a)))
  }
  return lumpify(new LatheGeometry(pts, 16).rotateZ(-Math.PI / 2), seed, 0.01)
}

const WHITE = '#fbf4ea'

/** Eyes dart between targets: hold a look, then snap there over two frames. */
function dart(frame, keys) {
  let prev = keys[0]
  for (const k of keys) {
    if (frame < k[0]) {
      const t = Math.min(Math.max((frame - (k[0] - 2)) / 2, 0), 1)
      return [prev[1] + (k[1] - prev[1]) * t, prev[2] + (k[2] - prev[2]) * t]
    }
    prev = k
  }
  return [prev[1], prev[2]]
}

const LOOKS = [
  [0, 0, -0.2],
  [40, 0.6, -0.5],
  [48, 0.95, -0.7],
  [56, 0.4, -0.8],
  [62, 1, -0.55],
  [72, 0.3, -0.9],
  [82, 0.85, -0.4],
  [100, 0.6, -0.2],
  [112, 1, 0.05],
  [126, 0.85, -0.15],
  [140, 0.6, -0.5],
  [154, 1, -0.45],
  [170, 0.3, 0.1],
  [206, 0, 0],
]

const hop = (frame, at, len, h) => {
  const t = (frame - at) / len
  return t > 0 && t < 1 ? Math.sin(Math.PI * t) * h : 0
}

export function Starburst() {
  const f = useCurrentFrame()

  const geo = useMemo(() => {
    const rays = RAYS.map(([, len, r], i) => rayGeometry(len, r * 1.35, i * 3.1))
    return {
      rays,
      body: lumpify(new SphereGeometry(0.44, 28, 20), 9, 0.015),
      eye: new SphereGeometry(0.095, 16, 12),
      pupil: new SphereGeometry(0.05, 12, 10),
      smile: new TorusGeometry(0.085, 0.022, 8, 20, Math.PI),
      o: new SphereGeometry(0.05, 12, 10),
      cheek: new CylinderGeometry(0.05, 0.05, 0.01, 14),
    }
  }, [])

  // ---- Body pose -------------------------------------------------------
  const x = key(f, [204, 216], [-2.0, -1.55])
  const y =
    hop(f, 27, 8, 0.32) + // stretch hop on waking
    hop(f, 160, 6, 0.22) + // celebration when 3 + 4 = 7 lands
    hop(f, 166, 5, 0.14) +
    hop(f, 214, 6, 0.25) // lockup bounce
  const yaw = key(f, [0, 36, 44, 96, 108, 168, 176, 204, 214], [0.1, 0.1, 0.5, 0.5, 0.6, 0.6, 0.28, 0.28, 0])
  const roll =
    key(f, [0, 12, 20, 40, 48, 56, 66, 74, 86, 96], [0.32, 0.3, 0, 0, -0.12, 0.1, -0.08, 0.12, 0, 0]) +
    Math.sin(f * 0.9) * 0.012 * (f < 14 ? 1 : 0) // snoring sway
  const sy =
    (f < 12 ? 1 + Math.sin(f * 0.8) * 0.025 : 1) * // sleepy breathing
    key(f, [20, 25, 29, 33, 36, 158, 160, 163, 212, 214, 218], [1, 1.12, 0.9, 1.04, 1, 1, 0.9, 1.06, 1, 0.9, 1])
  const sx = 1 / Math.sqrt(sy)

  // ---- Face ------------------------------------------------------------
  let open = key(f, [0, 12, 14, 15, 16, 18], [0.07, 0.07, 0.6, 0.12, 0.12, 1])
  for (const b of [88, 150, 194]) if (f === b) open = 0.12
  if (f >= 23 && f <= 29) open = 0.3 // squinting through the yawn
  const [lx, ly] = dart(f, LOOKS)

  const yawn = f >= 22 && f <= 30
  const surprised = (f >= 60 && f <= 68) || (f >= 178 && f <= 198)
  const smile = key(f, [0, 34, 40, 96, 104, 156, 160, 204, 210], [0.6, 0.6, 0.8, 0.8, 1, 1, 1.35, 1, 1.4])
  const oSize = yawn ? 1.9 : surprised ? 1 : 0

  // ---- Magnifying glass -----------------------------------------------
  const glassIn = prog(f, 168, 176)
  const glassOut = prog(f, 204, 210)
  const showGlass = f >= 168 && f < 210
  const bigEye = key(f, [176, 180, 202, 205], [1, 1.75, 1.75, 1])
  const armLift = key(f, [168, 174, 178, 204, 208], [0, 0.18, 0.06, 0.06, 0]) // little grab motion

  return (
    <group position={[x + boil(f, 'cx', 0.006), y, 0]} rotation={[0, yaw, roll + boil(f, 'cr', 0.008)]}>
      <group position={[0, BODY_Y, 0]} scale={[sx, sy, 1]}>
        {/* Body + rays */}
        <mesh geometry={geo.body} material={clay(TERRACOTTA)} scale={[1, 1, 0.78]} castShadow receiveShadow />
        {RAYS.map(([deg, len], i) => {
          const a = (deg * Math.PI) / 180 + boil(f, `ray${i}`, 0.018) + (i === ARM ? armLift : 0)
          return (
            <group key={i} rotation={[0, 0, a]}>
              <mesh
                geometry={geo.rays[i]}
                material={clay(TERRACOTTA)}
                position={[RAY_START, 0, 0]}
                scale={[1, 1, 0.82]}
                castShadow
                receiveShadow
              />
            </group>
          )
        })}

        {/* Eyes (index 0 = viewer's left) */}
        {[-1, 1].map((side) => {
          const s = side === 1 ? bigEye : 1
          return (
            <group key={side} position={[side * 0.16, 0.1, 0.3]} scale={[s, s * open, s]}>
              <mesh geometry={geo.eye} material={clay(WHITE)} scale={[1, 1.15, 0.55]} />
              <mesh geometry={geo.pupil} material={clay(INK)} position={[lx * 0.035, ly * 0.04, 0.045]} scale={[1, 1, 0.5]} />
            </group>
          )
        })}

        {/* Mouth: smile coil, or an "o" for yawns and surprises */}
        {oSize === 0 ? (
          <mesh geometry={geo.smile} material={clay(INK)} position={[0, -0.1, 0.34]} rotation={[0, 0, Math.PI]} scale={[smile, smile, 1]} />
        ) : (
          <mesh geometry={geo.o} material={clay(INK)} position={[0, -0.13, 0.33]} scale={[oSize, oSize * 1.15, 0.4]} />
        )}
        {/* Rosy cheeks */}
        {[-1, 1].map((side) => (
          <mesh key={side} geometry={geo.cheek} material={clay('#e8917a')} position={[side * 0.27, -0.06, 0.29]} rotation={[Math.PI / 2, 0, 0]} />
        ))}

        {/* Zzz while asleep */}
        {f < 15 &&
          [0, 1, 2].map((i) => {
            const t = ((f + i * 4) % 15) / 15
            const sc = 0.18 + i * 0.05
            return (
              <ClayGlyph
                key={i}
                ch="Z"
                color="#f4ead8"
                radius={0.11}
                castShadow={false}
                position={[0.5 + t * 0.6 + i * 0.12, 0.7 + t * 0.9, 0.1]}
                rotation={[0, 0, 0.3 - t * 0.4]}
                scale={sc * (1 - t * 0.4)}
              />
            )
          })}

        {/* Magnifying glass, held up to the right eye */}
        {showGlass && (
          <group
            position={[0.16 + (1 - glassIn) * 2.2, 0.1 - glassOut * 1.6, 0.58]}
            rotation={[0, 0, glassOut * 0.9]}
          >
            <MagnifyingGlass />
          </group>
        )}
      </group>
    </group>
  )
}

function MagnifyingGlass() {
  const geo = useMemo(
    () => ({
      rim: lumpify(new TorusGeometry(0.27, 0.05, 12, 36), 4, 0.008),
      lens: new CylinderGeometry(0.255, 0.255, 0.02, 36),
      handle: lumpify(new CapsuleGeometry(0.055, 0.62, 6, 12), 7, 0.01),
    }),
    [],
  )
  return (
    <group>
      <mesh geometry={geo.rim} material={clay('#6b4a33')} castShadow />
      <mesh geometry={geo.lens} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial color="#cfe8ff" transparent opacity={0.22} roughness={0.05} clearcoat={1} depthWrite={false} />
      </mesh>
      {/* Handle runs down-right towards the arm ray */}
      <group rotation={[0, 0, (-40 * Math.PI) / 180]}>
        <mesh geometry={geo.handle} material={clay('#6b4a33')} position={[0.27 + 0.36, 0, -0.18]} rotation={[0, 0.35, Math.PI / 2]} castShadow />
      </group>
    </group>
  )
}

