import { useLayoutEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { ThreeCanvas } from '@remotion/three'
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'
import { CapsuleGeometry, ConeGeometry, CylinderGeometry, SphereGeometry, TorusGeometry, Vector3 } from 'three'
import { INK, clay, getWallTexture, getWoodTexture, lumpify } from './clay.js'
import { ClayGlyph, glyphWidth } from './ClayGlyph.jsx'
import { MathBlocks } from './MathBlocks.jsx'
import { Soundtrack } from './Soundtrack.jsx'
import { Starburst } from './Starburst.jsx'
import { boil, key, pop } from './timeline.js'

// Camera stops: [frame, position, target]. Moves between stops are short and
// eased, like a hand-cranked motion-control rig.
const CAMERA = [
  [0, [-1.5, 1.75, 5.0], [-2.0, 1.1, 0]], //      close on the sleeping character
  [30, [-1.5, 1.75, 5.0], [-2.0, 1.1, 0]],
  [42, [0.2, 2.5, 7.4], [0.1, 0.65, 0.4]], //     wide: the messy numbers
  [96, [0.3, 2.45, 7.3], [0.2, 0.65, 0.4]],
  [112, [0.9, 2.1, 7.2], [0.9, 0.7, 0.3]], //     the equation assembling
  [164, [1.0, 2.05, 7.0], [1.0, 0.7, 0.3]],
  [174, [-1.55, 1.7, 4.3], [-2.0, 1.25, 0.2]], // close: magnifying glass
  [204, [-1.5, 1.68, 4.2], [-2.0, 1.25, 0.2]],
  [216, [0.55, 1.55, 7.6], [0.55, 1.0, 0]], //    lockup
]

function CameraRig() {
  const f = useCurrentFrame()
  const camera = useThree((s) => s.camera)
  useLayoutEffect(() => {
    const frames = CAMERA.map((c) => c[0])
    const p = [0, 1, 2].map((i) => key(f, frames, CAMERA.map((c) => c[1][i])))
    const t = [0, 1, 2].map((i) => key(f, frames, CAMERA.map((c) => c[2][i])))
    camera.position.set(p[0] + boil(f, 'camx', 0.004), p[1] + boil(f, 'camy', 0.004), p[2])
    camera.lookAt(new Vector3(...t))
    camera.updateProjectionMatrix()
  }, [f, camera])
  return null
}

function Desk() {
  const wood = getWoodTexture()
  const wall = getWallTexture()
  return (
    <group>
      <mesh position={[0, -0.25, 0.5]} receiveShadow>
        <boxGeometry args={[16, 0.5, 7]} />
        <meshStandardMaterial map={wood} roughness={0.65} />
      </mesh>
      {/* Front edge highlight strip */}
      <mesh position={[0, -0.02, 4.0]}>
        <boxGeometry args={[16, 0.04, 0.04]} />
        <meshStandardMaterial color="#c98a5a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 3.5, -3]} receiveShadow>
        <planeGeometry args={[30, 12]} />
        <meshStandardMaterial map={wall} roughness={1} />
      </mesh>
    </group>
  )
}

/** Background props: a pencil pot, a mug and a little cactus, all in clay. */
function Props() {
  const geo = useMemo(
    () => ({
      pot: lumpify(new CylinderGeometry(0.32, 0.28, 0.75, 20), 2, 0.012),
      pencil: new CylinderGeometry(0.045, 0.045, 1.0, 6),
      tip: new ConeGeometry(0.045, 0.14, 6),
      mug: lumpify(new CylinderGeometry(0.36, 0.33, 0.7, 22), 3, 0.012),
      handle: new TorusGeometry(0.17, 0.05, 10, 20),
      cactus: lumpify(new CapsuleGeometry(0.17, 0.5, 6, 12), 6, 0.015),
      arm: lumpify(new CapsuleGeometry(0.08, 0.2, 6, 10), 8, 0.01),
      plantPot: lumpify(new CylinderGeometry(0.28, 0.22, 0.4, 18), 5, 0.012),
      dot: new SphereGeometry(0.02, 6, 6),
    }),
    [],
  )
  const pencils = [
    ['#f2c14e', -0.12, 0.08, -0.15],
    ['#5aa0d8', 0.1, -0.05, 0.12],
    ['#e2725b', 0.0, 0.12, 0.05],
  ]
  return (
    <group>
      <group position={[-4.3, 0, -1.4]}>
        <mesh geometry={geo.pot} material={clay('#5b7a8c')} position={[0, 0.375, 0]} castShadow receiveShadow />
        {pencils.map(([c, x, z, r], i) => (
          <group key={i} position={[x, 0.95, z]} rotation={[r, 0, r * 1.4]}>
            <mesh geometry={geo.pencil} material={clay(c)} castShadow />
            <mesh geometry={geo.tip} material={clay('#f3d9b1')} position={[0, 0.57, 0]} />
          </group>
        ))}
      </group>
      <group position={[-3.0, 0, -2.0]}>
        <mesh geometry={geo.mug} material={clay('#f3eadb')} position={[0, 0.35, 0]} castShadow receiveShadow />
        <mesh geometry={geo.handle} material={clay('#f3eadb')} position={[0.37, 0.38, 0]} castShadow />
        <mesh position={[0, 0.69, 0]}>
          <cylinderGeometry args={[0.31, 0.31, 0.02, 22]} />
          <meshStandardMaterial color="#5a3420" roughness={0.3} />
        </mesh>
      </group>
      <group position={[-5.4, 0, 0.2]}>
        <mesh geometry={geo.plantPot} material={clay('#c46a4a')} position={[0, 0.2, 0]} castShadow receiveShadow />
        <mesh geometry={geo.cactus} material={clay('#6e9b5a')} position={[0, 0.78, 0]} castShadow />
        <mesh geometry={geo.arm} material={clay('#6e9b5a')} position={[0.2, 0.86, 0]} rotation={[0, 0, -0.9]} castShadow />
      </group>
    </group>
  )
}

/** "Claude" spelled in dark clay coils, popping in letter by letter. */
function Wordmark() {
  const f = useCurrentFrame()
  if (f < 210) return null
  const letters = 'Claude'.split('')
  const scale = 0.62
  const gap = 0.12
  const widths = letters.map((c) => glyphWidth(c) * scale)
  let x = -0.35
  return (
    <group>
      {letters.map((ch, i) => {
        const w = widths[i]
        const cx = x + w / 2
        x += w + gap
        const p = pop(f, 212 + i * 2, 5)
        if (p <= 0) return null
        return (
          <group key={i} position={[cx + boil(f, `w${i}`, 0.006), 0.7 * scale + 0.08, 0.2]} rotation={[0, 0, boil(f, `wr${i}`, 0.015)]} scale={scale * p}>
            <ClayGlyph ch={ch} color={INK} radius={0.12} />
          </group>
        )
      })}
    </group>
  )
}

function Lights() {
  const f = useCurrentFrame()
  const flicker = 1 + boil(f, 'light', 0.03) // tungsten lamps between exposures
  const lockup = key(f, [204, 216], [0, 1])
  return (
    <>
      <hemisphereLight args={['#fff1e0', '#7a4a2c', 0.9]} />
      <spotLight
        position={[-4, 7, 6]}
        angle={0.7}
        penumbra={0.75}
        intensity={(3.2 + lockup * 0.6) * flicker}
        decay={0}
        color="#ffd9b0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <directionalLight position={[5, 4, 3]} intensity={0.55} color="#ffe7cf" />
      <pointLight position={[-2, 2.8, 2.5]} intensity={0.8} decay={0} distance={0} color="#ffcf9e" />
    </>
  )
}

export function ClayMath() {
  const { width, height } = useVideoConfig()
  return (
    <AbsoluteFill style={{ backgroundColor: '#c99b74' }}>
      <Soundtrack />
      <ThreeCanvas
        width={width}
        height={height}
        shadows="percentage"
        camera={{ fov: 32, near: 0.1, far: 60, position: [0, 2, 7] }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <color attach="background" args={['#c99b74']} />
        <CameraRig />
        <Lights />
        <Desk />
        <Props />
        <Starburst />
        <MathBlocks />
        <Wordmark />
      </ThreeCanvas>
    </AbsoluteFill>
  )
}
