import { useMemo } from 'react'
import { PlaneGeometry } from 'three'

// Small deterministic PRNG so the landscape is identical on every load.
function mulberry32(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Keep a flat strip where the cables and stations sit.
const flatness = (z) => Math.min(1, Math.max(0, (Math.abs(z - 0.2) - 3.2) / 4))

function Ground() {
  const geometry = useMemo(() => {
    const rand = mulberry32(7)
    const g = new PlaneGeometry(90, 50, 60, 34)
    g.rotateX(-Math.PI / 2)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i) - 2 // world z (mesh is offset by -2)
      const hills = Math.sin(x * 0.18) * Math.cos(z * 0.22) * 1.4 + Math.max(0, -z - 10) * 0.35
      pos.setY(i, (hills + rand() * 0.6) * flatness(z) - 0.02)
    }
    g.computeVertexNormals()
    return g
  }, [])

  return (
    <mesh geometry={geometry} position={[0, 0, -2]} receiveShadow>
      <meshStandardMaterial color="#1c3a3a" flatShading roughness={1} />
    </mesh>
  )
}

function Scenery() {
  const items = useMemo(() => {
    const rand = mulberry32(42)
    const out = []
    while (out.length < 70) {
      const x = -36 + rand() * 72
      const z = -24 + rand() * 34
      if (Math.abs(z - 0.2) < 5.5) continue // keep the cable corridor clear
      const kind = rand() < 0.75 ? 'tree' : 'rock'
      const s = 0.6 + rand() * 0.9
      out.push({ x, z, kind, s, r: rand() * Math.PI })
    }
    return out
  }, [])

  return items.map(({ x, z, kind, s, r }, i) =>
    kind === 'tree' ? (
      <group key={i} position={[x, -0.05, z]} scale={s} rotation={[0, r, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.16, 1, 5]} />
          <meshStandardMaterial color="#4a3426" flatShading />
        </mesh>
        <mesh position={[0, 1.6, 0]} castShadow>
          <coneGeometry args={[0.9, 1.8, 6]} />
          <meshStandardMaterial color={i % 3 ? '#2f6b4f' : '#3d7f55'} flatShading />
        </mesh>
        <mesh position={[0, 2.5, 0]} castShadow>
          <coneGeometry args={[0.6, 1.2, 6]} />
          <meshStandardMaterial color="#3f8a5c" flatShading />
        </mesh>
      </group>
    ) : (
      <mesh key={i} position={[x, 0.15 * s, z]} scale={[s, s * 0.6, s]} rotation={[r, r, 0]} castShadow>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#5b6475" flatShading />
      </mesh>
    ),
  )
}

export default function Environment() {
  return (
    <>
      <Ground />
      <Scenery />
    </>
  )
}
