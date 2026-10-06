import { useMemo } from 'react'
import { useCurrentFrame } from 'remotion'
import { MeshStandardMaterial, SphereGeometry } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { BLUE, clay, getGlowMaterial, lumpify } from './clay.js'
import { ClayGlyph } from './ClayGlyph.jsx'
import { boil, key, pop, prog } from './timeline.js'

// The equation the character "solves": messy clay tokens -> 3 + 4 = 7.
const ROW_X = [-0.5, 0.45, 1.4, 2.35, 3.3]
const TOKENS = [
  { ch: '3', color: '#e8b64a', digit: true, mess: [-0.1, 1.25, 0.7, 0.25] },
  { ch: '+', color: '#f1e6cf', digit: false, mess: [2.2, 1.55, -0.4, -0.2] },
  { ch: '4', color: '#6fb39b', digit: true, mess: [0.9, 0.55, -1.1, 0.3] },
  { ch: '=', color: '#f1e6cf', digit: false, mess: [0.25, 0.15, 2.1, -0.15] },
  { ch: '7', color: '#e48a9e', digit: true, mess: [2.9, 0.75, 0.35, 0.2] },
]
// When each token hops into the row (frames), in a playful order.
const HOP_AT = [98, 110, 104, 116, 122]
const HOP_LEN = 8
const BLOCK_AT = [130, null, 134, null, 138]
const ROW_Y = 0.5
const ROW_Z = 0.15

// Unit cubes: 3 under "3" and 4 under "4", which then slide together under "7".
const UNIT = 0.16
const UNIT_Z = 0.95
const UNITS = [...Array(3)].map((_, i) => ({ from: ROW_X[0] + (i - 1) * 0.19, pop: 142 + i }))
  .concat([...Array(4)].map((_, i) => ({ from: ROW_X[2] + (i - 1.5) * 0.19, pop: 145 + i })))
  .map((u, k) => ({ ...u, to: ROW_X[4] + (k - 3) * 0.19, move: 150 + k }))

// Leftover crumbs of clay on the desk, for the "messy" start.
const CRUMBS = [
  [-0.6, 0.9, '#e8b64a', 0.07],
  [1.5, 1.4, '#6fb39b', 0.06],
  [3.4, 1.3, '#e48a9e', 0.08],
  [0.6, 1.6, '#f1e6cf', 0.05],
  [2.6, 0.2, '#e8b64a', 0.06],
]

const lerp = (a, b, t) => a + (b - a) * t

export function MathBlocks() {
  const f = useCurrentFrame()
  const geo = useMemo(
    () => ({
      block: new RoundedBoxGeometry(0.82, 0.82, 0.82, 4, 0.1),
      unit: new RoundedBoxGeometry(UNIT, UNIT, UNIT, 3, 0.035),
      crumb: lumpify(new SphereGeometry(1, 14, 10), 5, 0.08),
    }),
    [],
  )
  const blockMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#3b7dff',
        emissive: '#1f6bff',
        emissiveIntensity: 0.9,
        roughness: 0.2,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
      }),
    [],
  )
  const unitMat = useMemo(
    () => new MeshStandardMaterial({ color: '#9cc4ff', emissive: BLUE, emissiveIntensity: 1.4, roughness: 0.3 }),
    [],
  )

  // Everything clears away for the logo lockup.
  const exit = (i) => 1 - prog(f, 204 + i, 210 + i)
  if (f >= 216) return null

  // Glow pulse; the answer block flashes when the units land.
  const pulse = 0.85 + Math.sin(f * 0.9) * 0.15
  blockMat.emissiveIntensity = pulse
  const answerFlash = key(f, [160, 162, 168], [1, 2.2, 1.2])

  return (
    <group>
      {TOKENS.map((t, i) => {
        const [mx, mz, mrot, tilt] = t.mess
        const h = prog(f, HOP_AT[i], HOP_AT[i] + HOP_LEN)
        // "Inspecting": the character pokes the 4 and then the 3.
        const poke = i === 2 && f >= 60 && f <= 68 ? Math.sin((f - 60) * 1.6) * 0.25 : i === 0 && f >= 74 && f <= 82 ? Math.sin((f - 74) * 1.6) * 0.2 : 0
        const pos = [
          lerp(mx, ROW_X[i], h),
          lerp(0.1, ROW_Y, h) + Math.sin(Math.PI * h) * 1.1,
          lerp(mz, ROW_Z, h),
        ]
        const rot = [lerp(-Math.PI / 2 + tilt, 0, h), Math.sin(Math.PI * h) * Math.PI, lerp(mrot, 0, h) + poke]
        const sc = lerp(0.42, t.digit ? 0.34 : 0.28, h) * exit(i)
        const block = t.digit ? pop(f, BLOCK_AT[i], 5) * exit(i) : 0
        const isAnswer = i === 4
        return (
          <group key={t.ch}>
            <group
              position={[pos[0] + boil(f, `tx${i}`, 0.008), pos[1], pos[2] + boil(f, `tz${i}`, 0.008)]}
              rotation={[rot[0], rot[1], rot[2] + boil(f, `tr${i}`, 0.02)]}
              scale={sc}
            >
              <ClayGlyph ch={t.ch} color={t.color} radius={0.13} />
            </group>
            {block > 0 && (
              <group position={[ROW_X[i], ROW_Y, ROW_Z]} scale={block} rotation={[0, boil(f, `b${i}`, 0.03), 0]}>
                <mesh geometry={geo.block} material={blockMat} renderOrder={2} />
                <sprite material={getGlowMaterial()} scale={(isAnswer ? 1.5 * answerFlash : 1.3) * pulse} position={[0, 0, 0.1]} />
                <pointLight color={BLUE} intensity={(isAnswer ? 2.2 * answerFlash : 1.6) * pulse} distance={2.6} decay={1.5} position={[0, 0.2, 0.6]} />
              </group>
            )}
          </group>
        )
      })}

      {UNITS.map((u, k) => {
        const p = pop(f, u.pop, 4) * exit(4)
        if (p <= 0) return null
        const m = prog(f, u.move, u.move + 5)
        return (
          <mesh
            key={k}
            geometry={geo.unit}
            material={unitMat}
            position={[lerp(u.from, u.to, m), UNIT / 2 + 0.01 + Math.sin(Math.PI * m) * 0.35, UNIT_Z]}
            rotation={[0, boil(f, `u${k}`, 0.05), 0]}
            scale={p}
            castShadow
          />
        )
      })}

      {/* Crumbs get tidied away as the maths organises itself */}
      {CRUMBS.map(([x, z, c, r], i) => {
        const s = 1 - prog(f, 100 + i * 3, 106 + i * 3)
        return s > 0 ? <mesh key={i} geometry={geo.crumb} material={clay(c)} position={[x, r * 0.6, z]} scale={[r * s, r * 0.6 * s, r * s]} castShadow /> : null
      })}
    </group>
  )
}
