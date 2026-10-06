import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const LED_COLORS = ['#3dff8b', '#3dff8b', '#4de1ff', '#ffb347']

/** Low-poly Wi-Fi router with blinking activity LEDs, on a small shelf. */
export default function Router(props) {
  const leds = useRef([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    leds.current.forEach((m, i) => {
      if (!m) return
      // Pseudo-random flicker, like real traffic LEDs.
      const on = Math.sin(t * (7 + i * 3.1) + i) + Math.sin(t * (13 + i)) > 0.2
      m.emissiveIntensity = on ? 4 : 0.3
    })
  })

  return (
    <group {...props}>
      {/* Shelf */}
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.1, 0.76, 6]} />
        <meshStandardMaterial color="#3b4660" flatShading roughness={0.9} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[1.7, 0.36, 1.1]} />
        <meshStandardMaterial color="#1f2533" flatShading roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.14, 0]} castShadow>
        <boxGeometry args={[1.5, 0.04, 0.95]} />
        <meshStandardMaterial color="#2c3448" flatShading />
      </mesh>

      {/* Activity LEDs on the front */}
      {LED_COLORS.map((c, i) => (
        <mesh key={i} position={[-0.45 + i * 0.3, 0.95, 0.556]}>
          <boxGeometry args={[0.12, 0.05, 0.02]} />
          <meshStandardMaterial
            ref={(m) => (leds.current[i] = m)}
            color={c}
            emissive={c}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Antennas */}
      {[-0.65, 0, 0.65].map((x, i) => (
        <mesh
          key={x}
          position={[x, 1.55, -0.45]}
          rotation={[-0.15, 0, (i - 1) * -0.35]}
          castShadow
        >
          <cylinderGeometry args={[0.035, 0.06, 1.0, 5]} />
          <meshStandardMaterial color="#141822" flatShading />
        </mesh>
      ))}

      {/* Optical network terminal (ONT) clipped to the side where fibre leaves */}
      <mesh position={[0.92, 0.95, 0]} castShadow>
        <boxGeometry args={[0.16, 0.3, 0.5]} />
        <meshStandardMaterial color="#e8ecf4" flatShading />
      </mesh>
      <mesh position={[1.0, 1.03, 0.1]}>
        <boxGeometry args={[0.02, 0.04, 0.04]} />
        <meshStandardMaterial color="#4de1ff" emissive="#4de1ff" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  )
}
