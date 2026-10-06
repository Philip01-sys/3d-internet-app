import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Object3D } from 'three'

const UNITS = 9 // rack-mounted servers per rack
const LEDS_PER_UNIT = 6

function Rack({ activity = 1, ...props }) {
  const leds = useRef()
  const count = UNITS * LEDS_PER_UNIT
  const palette = useMemo(
    () => [new Color('#3dff8b').multiplyScalar(4), new Color('#4de1ff').multiplyScalar(4), new Color('#ffb347').multiplyScalar(4)],
    [],
  )
  const off = useMemo(() => new Color('#0b2216'), [])

  useLayoutEffect(() => {
    const d = new Object3D()
    for (let u = 0; u < UNITS; u++) {
      for (let l = 0; l < LEDS_PER_UNIT; l++) {
        d.position.set(0.25 + l * 0.09, 0.3 + u * 0.3, 0.61)
        d.updateMatrix()
        leds.current.setMatrixAt(u * LEDS_PER_UNIT + l, d.matrix)
        leds.current.setColorAt(u * LEDS_PER_UNIT + l, off)
      }
    }
    leds.current.instanceMatrix.needsUpdate = true
  }, [off])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const on = Math.sin(t * (5 + (i % 7) * 2.3) + i * 1.7) * Math.sin(t * 3.1 + i) > 0.15 - activity * 0.3
      leds.current.setColorAt(i, on ? palette[i % 3] : off)
    }
    leds.current.instanceColor.needsUpdate = true
  })

  return (
    <group {...props}>
      {/* Frame */}
      <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 3.1, 1.2]} />
        <meshStandardMaterial color="#161b26" flatShading roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Server units */}
      {Array.from({ length: UNITS }, (_, u) => (
        <group key={u} position={[0, 0.3 + u * 0.3, 0]}>
          <mesh position={[0, 0, 0.58]}>
            <boxGeometry args={[1.45, 0.24, 0.04]} />
            <meshStandardMaterial color="#2a3244" flatShading metalness={0.5} roughness={0.4} />
          </mesh>
          {/* vent slots */}
          <mesh position={[-0.35, 0, 0.605]}>
            <planeGeometry args={[0.55, 0.12]} />
            <meshStandardMaterial color="#0c0f16" />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={leds} args={[null, null, count]}>
        <boxGeometry args={[0.05, 0.05, 0.02]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {/* Top cap */}
      <mesh position={[0, 3.14, 0]}>
        <boxGeometry args={[1.66, 0.08, 1.26]} />
        <meshStandardMaterial color="#0f131b" flatShading />
      </mesh>
    </group>
  )
}

/** Small data-centre: a raised floor with three server racks. */
export default function Server(props) {
  return (
    <group {...props}>
      <mesh position={[0.9, 0.05, 0]} receiveShadow>
        <boxGeometry args={[6.2, 0.1, 2.6]} />
        <meshStandardMaterial color="#2a3142" flatShading />
      </mesh>
      <Rack position={[0, 0.1, 0]} activity={1} />
      <Rack position={[1.75, 0.1, 0]} activity={0.6} />
      <Rack position={[3.5, 0.1, 0]} activity={0.4} />
    </group>
  )
}
