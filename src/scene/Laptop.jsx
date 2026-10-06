import { useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

function useBrowserTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 320
    const g = c.getContext('2d')
    g.fillStyle = '#0d1424'
    g.fillRect(0, 0, 512, 320)
    // Browser chrome
    g.fillStyle = '#1b2640'
    g.fillRect(0, 0, 512, 46)
    ;['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
      g.fillStyle = col
      g.beginPath()
      g.arc(20 + i * 20, 23, 6, 0, Math.PI * 2)
      g.fill()
    })
    g.fillStyle = '#0d1424'
    g.beginPath()
    g.roundRect(90, 11, 400, 24, 12)
    g.fill()
    g.fillStyle = '#7ee8a5'
    g.font = 'bold 15px monospace'
    g.fillText('🔒', 100, 29)
    g.fillStyle = '#e6edf7'
    g.fillText('https://example.com', 124, 29)
    // Request being sent
    g.fillStyle = '#4de1ff'
    g.font = 'bold 26px monospace'
    g.fillText('GET /index.html', 40, 110)
    g.fillStyle = '#8aa0c8'
    g.font = '16px monospace'
    g.fillText('Host: example.com', 40, 145)
    g.fillText('Accept: text/html', 40, 170)
    // Loading bar
    g.fillStyle = '#1b2640'
    g.fillRect(40, 220, 432, 12)
    g.fillStyle = '#4de1ff'
    g.fillRect(40, 220, 260, 12)
    g.fillStyle = '#8aa0c8'
    g.fillText('Waiting for 93.184.216.34…', 40, 270)
    const tex = new CanvasTexture(c)
    tex.colorSpace = SRGBColorSpace
    return tex
  }, [])
}

/** Low-poly laptop sitting on a small desk. */
export default function Laptop(props) {
  const screen = useBrowserTexture()
  return (
    <group {...props}>
      {/* Desk */}
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.1, 2.0]} />
        <meshStandardMaterial color="#6b4a33" flatShading roughness={0.8} />
      </mesh>
      {[
        [-1.55, -0.85],
        [1.55, -0.85],
        [-1.55, 0.85],
        [1.55, 0.85],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.45, z]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.9, 5]} />
          <meshStandardMaterial color="#4b3323" flatShading />
        </mesh>
      ))}

      {/* Laptop base */}
      <group position={[0, 1.0, 0]}>
        <mesh position={[0, 0.04, 0]} castShadow>
          <boxGeometry args={[2.2, 0.08, 1.45]} />
          <meshStandardMaterial color="#9aa3b5" flatShading metalness={0.6} roughness={0.35} />
        </mesh>
        {/* Keyboard + trackpad */}
        <mesh position={[0, 0.082, -0.12]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.85, 0.75]} />
          <meshStandardMaterial color="#20252f" flatShading />
        </mesh>
        <mesh position={[0, 0.082, 0.48]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.6, 0.35]} />
          <meshStandardMaterial color="#7d8597" flatShading />
        </mesh>
        {/* Ethernet port on the right side */}
        <mesh position={[1.1, 0.04, 0]}>
          <boxGeometry args={[0.04, 0.05, 0.12]} />
          <meshStandardMaterial color="#111" />
        </mesh>

        {/* Lid, hinged at the back edge */}
        <group position={[0, 0.08, -0.72]} rotation={[-0.22, 0, 0]}>
          <mesh position={[0, 0.72, 0]} castShadow>
            <boxGeometry args={[2.2, 1.45, 0.06]} />
            <meshStandardMaterial color="#9aa3b5" flatShading metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.74, 0.032]}>
            <planeGeometry args={[2.0, 1.25]} />
            <meshBasicMaterial map={screen} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* Coffee mug, for scale */}
      <mesh position={[-1.25, 1.15, 0.5]} castShadow>
        <cylinderGeometry args={[0.13, 0.11, 0.3, 7]} />
        <meshStandardMaterial color="#e2574c" flatShading />
      </mesh>
    </group>
  )
}
