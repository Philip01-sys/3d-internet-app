import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, Color, SRGBColorSpace, Vector3 } from 'three'
import { journeyCurve } from '../paths.js'
import { STATIONS, TRAVEL_SECONDS } from '../stations.js'
import { REQUEST_COLOR, RESPONSE_COLOR } from './Cables.jsx'

const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const RESPONSE_SECONDS = 4.5

/** Text tag drawn into a canvas and shown as a camera-facing sprite. */
function useTagTexture(text, color) {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 96
    const g = c.getContext('2d')
    g.font = 'bold 44px ui-monospace, Menlo, monospace'
    const w = Math.min(500, g.measureText(text).width + 48)
    const x = (512 - w) / 2
    g.fillStyle = 'rgba(6, 10, 24, 0.82)'
    g.strokeStyle = color
    g.lineWidth = 4
    g.beginPath()
    g.roundRect(x, 10, w, 76, 16)
    g.fill()
    g.stroke()
    g.fillStyle = color
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText(text, 256, 50)
    const tex = new CanvasTexture(c)
    tex.colorSpace = SRGBColorSpace
    return tex
  }, [text, color])
}

function GlowPacket({ color, innerRef }) {
  const glow = useMemo(() => new Color(color).multiplyScalar(6), [color])
  const halo = useMemo(() => new Color(color).multiplyScalar(1.5), [color])
  return (
    <group ref={innerRef}>
      <mesh>
        <octahedronGeometry args={[0.16, 0]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshBasicMaterial color={halo} toneMapped={false} transparent opacity={0.25} wireframe />
      </mesh>
      <pointLight color={color} intensity={6} distance={4} decay={2} />
    </group>
  )
}

/** Packet whose tag stays upright: the mesh spins, the label does not. */
function TaggedPacket({ color, label, posRef, spinRef }) {
  const tag = useTagTexture(label, color)
  return (
    <group ref={posRef}>
      <GlowPacket color={color} innerRef={spinRef} />
      {/* sizeAttenuation=false keeps the tag a constant size on screen. */}
      <sprite position={[0, 0.45, 0]} scale={[0.17, 0.032, 1]} center={[0.5, 0]} renderOrder={10}>
        <spriteMaterial map={tag} transparent depthTest={false} toneMapped={false} sizeAttenuation={false} />
      </sprite>
    </group>
  )
}

/**
 * The request packet glides along the journey curve to the selected station.
 * Once it reaches the server, an amber response packet loops back to the laptop.
 */
export default function Packet({ station }) {
  const req = useRef()
  const reqSpin = useRef()
  const res = useRef()
  const resSpin = useRef()
  const anim = useRef({ from: STATIONS[0].u, to: STATIONS[0].u, u: STATIONS[0].u, start: null })
  const [showResponse, setShowResponse] = useState(false)
  const responseStart = useRef(0)
  const p = useMemo(() => new Vector3(), [])

  useEffect(() => {
    const a = anim.current
    a.from = a.u
    a.to = STATIONS[station].u
    a.start = null
    setShowResponse(false)
  }, [station])

  useFrame(({ clock }) => {
    const a = anim.current
    const t = clock.elapsedTime
    if (a.start === null) a.start = t
    const k = Math.min((t - a.start) / TRAVEL_SECONDS, 1)
    a.u = a.from + (a.to - a.from) * easeInOutCubic(k)

    journeyCurve.getPointAt(a.u, p)
    req.current.position.copy(p)
    // Slight bob while resting.
    if (k === 1) req.current.position.y += Math.sin(t * 2.5) * 0.04
    reqSpin.current.rotation.set(t * 1.3, t * 2, 0)

    const atServer = station === STATIONS.length - 1 && k === 1
    if (atServer && !showResponse) {
      responseStart.current = t
      setShowResponse(true)
    }
    if (showResponse && res.current) {
      const r = ((t - responseStart.current) % RESPONSE_SECONDS) / RESPONSE_SECONDS
      journeyCurve.getPointAt(1 - easeInOutCubic(r), p)
      res.current.position.copy(p)
      resSpin.current.rotation.set(0, -t * 2, t)
    }
  })

  return (
    <>
      <TaggedPacket posRef={req} spinRef={reqSpin} color={REQUEST_COLOR} label="GET /index.html" />
      {showResponse && <TaggedPacket posRef={res} spinRef={resSpin} color={RESPONSE_COLOR} label="HTTP 200 OK" />}
    </>
  )
}
