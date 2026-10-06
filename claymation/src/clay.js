import {
  AdditiveBlending,
  CanvasTexture,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  SpriteMaterial,
} from 'three'
import { random } from 'remotion'

// Palette
export const TERRACOTTA = '#d97757'
export const INK = '#2b2420'
export const BLUE = '#3d8bff'

const canvas = (w, h) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

let clayBump
/** Grey bump map with lumps, smears and thumbprints: the "handled clay" look. */
export function getClayBump() {
  if (clayBump) return clayBump
  const [c, g] = canvas(512, 512)
  g.fillStyle = '#808080'
  g.fillRect(0, 0, 512, 512)
  let n = 0
  const r = () => random(`bump${n++}`)
  for (let i = 0; i < 900; i++) {
    const v = Math.floor(100 + r() * 56)
    g.fillStyle = `rgba(${v},${v},${v},0.35)`
    g.beginPath()
    g.ellipse(r() * 512, r() * 512, 2 + r() * 14, 2 + r() * 8, r() * Math.PI, 0, Math.PI * 2)
    g.fill()
  }
  // Thumbprints: concentric arcs
  for (let p = 0; p < 7; p++) {
    const cx = r() * 512
    const cy = r() * 512
    for (let k = 2; k < 14; k++) {
      g.strokeStyle = `rgba(${k % 2 ? 160 : 96},${k % 2 ? 160 : 96},${k % 2 ? 160 : 96},0.25)`
      g.lineWidth = 1.5
      g.beginPath()
      g.ellipse(cx, cy, k * 3.2, k * 2.4, p, 0.3, Math.PI * 1.6)
      g.stroke()
    }
  }
  clayBump = new CanvasTexture(c)
  clayBump.wrapS = clayBump.wrapT = RepeatWrapping
  return clayBump
}

const matCache = new Map()
/** Matte plasticine material in the given colour (cached). */
export function clay(color, { emissive, emissiveIntensity = 0 } = {}) {
  const k = `${color}|${emissive}|${emissiveIntensity}`
  if (!matCache.has(k)) {
    matCache.set(
      k,
      new MeshStandardMaterial({
        color,
        roughness: 0.72,
        metalness: 0,
        bumpMap: getClayBump(),
        bumpScale: 4,
        emissive: emissive ?? '#000000',
        emissiveIntensity,
      }),
    )
  }
  return matCache.get(k)
}

/**
 * Push vertices in/out with a smooth pseudo-noise so every primitive looks
 * hand-rolled rather than machine-perfect.
 */
export function lumpify(geometry, seed = 1, amount = 0.015) {
  const pos = geometry.attributes.position
  const nor = geometry.attributes.normal
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const n =
      Math.sin(x * 9.1 + seed) * Math.sin(y * 7.3 + seed * 1.7) * Math.sin(z * 8.7 + seed * 0.6) +
      0.5 * Math.sin(x * 21 + y * 17 + seed * 3.1)
    const d = n * amount
    pos.setXYZ(i, x + nor.getX(i) * d, y + nor.getY(i) * d, z + nor.getZ(i) * d)
  }
  geometry.computeVertexNormals()
  return geometry
}

let wood
/** Warm wooden desk-top texture with grain lines and knots. */
export function getWoodTexture() {
  if (wood) return wood
  const [c, g] = canvas(1024, 512)
  const grad = g.createLinearGradient(0, 0, 0, 512)
  grad.addColorStop(0, '#a8693f')
  grad.addColorStop(0.5, '#b5774a')
  grad.addColorStop(1, '#9c5f37')
  g.fillStyle = grad
  g.fillRect(0, 0, 1024, 512)
  let n = 0
  const r = () => random(`wood${n++}`)
  for (let i = 0; i < 140; i++) {
    const y = r() * 512
    const dark = r() > 0.5
    g.strokeStyle = dark ? `rgba(90,48,22,${0.12 + r() * 0.2})` : `rgba(214,160,112,${0.08 + r() * 0.15})`
    g.lineWidth = 0.6 + r() * 2.4
    g.beginPath()
    g.moveTo(0, y)
    for (let x = 0; x <= 1024; x += 32) g.lineTo(x, y + Math.sin(x * 0.006 + i) * 6 + Math.sin(x * 0.02 + i * 3) * 1.5)
    g.stroke()
  }
  for (let k = 0; k < 4; k++) {
    const kx = r() * 1024
    const ky = r() * 512
    for (let j = 1; j < 7; j++) {
      g.strokeStyle = `rgba(80,40,18,${0.35 - j * 0.04})`
      g.lineWidth = 1.5
      g.beginPath()
      g.ellipse(kx, ky, j * 7, j * 3, 0, 0, Math.PI * 2)
      g.stroke()
    }
  }
  wood = new CanvasTexture(c)
  wood.colorSpace = SRGBColorSpace
  wood.wrapS = wood.wrapT = RepeatWrapping
  wood.repeat.set(1.5, 1)
  return wood
}

let wall
/** Soft warm studio backdrop with a lamp hot-spot and vignette. */
export function getWallTexture() {
  if (wall) return wall
  const [c, g] = canvas(1024, 512)
  g.fillStyle = '#d9b48f'
  g.fillRect(0, 0, 1024, 512)
  const spot = g.createRadialGradient(430, 230, 20, 430, 230, 620)
  spot.addColorStop(0, 'rgba(255,236,206,0.95)')
  spot.addColorStop(0.45, 'rgba(240,200,160,0.5)')
  spot.addColorStop(1, 'rgba(120,70,40,0.9)')
  g.fillStyle = spot
  g.fillRect(0, 0, 1024, 512)
  wall = new CanvasTexture(c)
  wall.colorSpace = SRGBColorSpace
  return wall
}

let glow
/** Additive radial glow sprite used behind the blue blocks. */
export function getGlowMaterial() {
  if (glow) return glow
  const [c, g] = canvas(256, 256)
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  grad.addColorStop(0, 'rgba(90,160,255,0.55)')
  grad.addColorStop(0.35, 'rgba(50,120,255,0.25)')
  grad.addColorStop(1, 'rgba(40,100,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  glow = new SpriteMaterial({ map: tex, blending: AdditiveBlending, depthWrite: false, transparent: true })
  return glow
}
