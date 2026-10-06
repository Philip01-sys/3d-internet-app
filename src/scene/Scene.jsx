import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, Html, Stars } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import Laptop from './Laptop.jsx'
import Router from './Router.jsx'
import Server from './Server.jsx'
import Cables from './Cables.jsx'
import Packet from './Packet.jsx'
import CameraRig from './CameraRig.jsx'
import Environment from './Environment.jsx'
import { OVERVIEW, STATIONS } from '../stations.js'

/** Wraps a station model so it is clickable and gets a floating label. */
function Station({ index, active, onSelect, children }) {
  const [hovered, setHovered] = useState(false)
  const s = STATIONS[index]
  return (
    <group
      onClick={(e) => {
        e.stopPropagation()
        onSelect(index)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = ''
      }}
    >
      {children}
      <Html position={s.labelPosition} center zIndexRange={[20, 0]}>
        <button
          type="button"
          className={`station-label${active ? ' active' : ''}${hovered ? ' hover' : ''}`}
          onClick={() => onSelect(index)}
        >
          <span className="num">{index + 1}</span>
          {s.name}
        </button>
      </Html>
    </group>
  )
}

export default function Scene({ station, overview, onSelect }) {
  const pose = overview ? OVERVIEW : STATIONS[station].camera

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      camera={{ fov: 45, near: 0.1, far: 200, position: OVERVIEW.position }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      // `clip` (unlike `hidden`) can't be scrolled by focusing an off-screen label.
      style={{ overflow: 'clip' }}
    >
      <color attach="background" args={['#060a18']} />
      <fog attach="fog" args={['#060a18', 22, 65]} />
      <Stars radius={90} depth={40} count={2500} factor={3} saturation={0} fade speed={0.6} />

      <hemisphereLight args={['#8fb3ff', '#1a2a2a', 0.55]} />
      <directionalLight
        position={[-10, 18, 12]}
        intensity={1.6}
        color="#cfdcff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0005}
      />
      <pointLight position={[15, 5, 3]} color="#4de1ff" intensity={20} distance={14} />
      <pointLight position={[-16, 4, 3]} color="#ffd29a" intensity={14} distance={10} />

      <CameraRig pose={pose} />
      <Environment />
      <Cables />
      <Packet station={station} />

      <Station index={0} active={station === 0} onSelect={onSelect}>
        <Laptop position={[-16, 0, 0.8]} />
      </Station>
      <Station index={1} active={station === 1} onSelect={onSelect}>
        <Router position={[-8, 0, -1]} />
      </Station>
      <Station index={2} active={station === 2} onSelect={onSelect}>
        {/* The fibre run itself is the station; an invisible hit-box makes it clickable. */}
        <mesh position={[2, 0.3, 0.9]} visible={false}>
          <boxGeometry args={[6, 0.8, 1.4]} />
        </mesh>
      </Station>
      <Station index={3} active={station === 3} onSelect={onSelect}>
        <Server position={[15.2, 0, -0.5]} />
      </Station>

      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={1.1} radius={0.7} />
        <Vignette offset={0.25} darkness={0.7} />
      </EffectComposer>
      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
