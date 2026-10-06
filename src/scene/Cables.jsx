import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Object3D, Vector3 } from 'three'
import { closestU, ethernetCurve, fiberCenterCurve, fiberCurves, subCurve } from '../paths.js'

export const REQUEST_COLOR = '#4de1ff'
export const RESPONSE_COLOR = '#ffb347'
const ELECTRIC_COLOR = '#c9d6ff'

/**
 * A stream of glowing comet-like pulses travelling along `curve`.
 * Each pulse is drawn as a head plus a short fading tail of instances.
 */
function PulseStream({ curve, count = 6, speed = 4, color, reverse = false, size = 0.06, trail = 7, spacing = 0.09, phase = 0 }) {
  const mesh = useRef()
  const length = useMemo(() => curve.getLength(), [curve])
  const dummy = useMemo(() => new Object3D(), [])
  const p = useMemo(() => new Vector3(), [])
  const col = useMemo(() => new Color(color).multiplyScalar(5), [color])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const du = spacing / length
    let i = 0
    for (let n = 0; n < count; n++) {
      const head = (((t * speed) / length + n / count + phase) % 1 + 1) % 1
      for (let k = 0; k < trail; k++) {
        let u = head - k * du
        const visible = u >= 0
        u = Math.min(Math.max(u, 0), 1)
        const along = reverse ? 1 - u : u
        curve.getPointAt(along, p)
        // Fade in/out near the ends so pulses don't pop.
        const edge = Math.min(1, u / 0.03, (1 - u) / 0.03)
        const s = visible ? size * (1 - k / trail) * edge : 0
        dummy.position.copy(p)
        dummy.scale.setScalar(Math.max(s, 0.0001))
        dummy.updateMatrix()
        mesh.current.setMatrixAt(i++, dummy.matrix)
      }
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[null, null, count * trail]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={col} toneMapped={false} />
    </instancedMesh>
  )
}

/** Copper Ethernet + three-strand fibre bundle, with traffic flowing both ways. */
export default function Cables() {
  // Transparent cut-away conduit around the fibre at the "fibre" station.
  const conduit = useMemo(() => {
    const u = closestU(fiberCenterCurve, new Vector3(2, 0.08, 1))
    return subCurve(fiberCenterCurve, u - 0.12, u + 0.12)
  }, [])

  return (
    <group>
      {/* Ethernet (copper) */}
      <mesh castShadow>
        <tubeGeometry args={[ethernetCurve, 120, 0.045, 6, false]} />
        <meshStandardMaterial color="#3a7bd5" flatShading roughness={0.6} />
      </mesh>
      <PulseStream curve={ethernetCurve} color={ELECTRIC_COLOR} count={5} speed={3} size={0.05} />
      <PulseStream curve={ethernetCurve} color={RESPONSE_COLOR} count={3} speed={3} size={0.045} reverse phase={0.4} />

      {/* Fibre strands: glassy cladding with a faint glowing core */}
      {fiberCurves.map((c, i) => (
        <group key={i}>
          <mesh>
            <tubeGeometry args={[c, 260, 0.04, 6, false]} />
            <meshPhysicalMaterial
              color="#bfe9ff"
              transparent
              opacity={0.35}
              roughness={0.1}
              transmission={0.6}
              thickness={0.1}
              flatShading
            />
          </mesh>
          <mesh>
            <tubeGeometry args={[c, 260, 0.012, 4, false]} />
            <meshBasicMaterial color={new Color(i === 1 ? '#ff4de1' : REQUEST_COLOR).multiplyScalar(0.6)} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* Request light (cyan) on the outer strands, response light (amber) on the
          middle one, and a second wavelength (magenta) to hint at DWDM. */}
      <PulseStream curve={fiberCurves[0]} color={REQUEST_COLOR} count={9} speed={7} size={0.055} />
      <PulseStream curve={fiberCurves[2]} color={REQUEST_COLOR} count={7} speed={8} size={0.05} phase={0.5} />
      <PulseStream curve={fiberCurves[1]} color={RESPONSE_COLOR} count={8} speed={7.5} size={0.055} reverse phase={0.2} />
      <PulseStream curve={fiberCurves[2]} color="#ff4de1" count={4} speed={6} size={0.04} phase={0.15} />

      {/* Wireframe conduit section */}
      <mesh>
        <tubeGeometry args={[conduit, 40, 0.3, 7, false]} />
        <meshBasicMaterial color="#4de1ff" wireframe transparent opacity={0.18} />
      </mesh>

      {/* Buried-cable marker posts */}
      {[
        [-3.5, 1.5],
        [6.5, 1.5],
        [11, 0.9],
      ].map(([x, z]) => (
        <group key={x} position={[x, 0, z]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 0.8, 6]} />
            <meshStandardMaterial color="#ff8a1f" flatShading />
          </mesh>
          <mesh position={[0, 0.84, 0]}>
            <coneGeometry args={[0.1, 0.12, 6]} />
            <meshStandardMaterial color="#ffffff" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}
