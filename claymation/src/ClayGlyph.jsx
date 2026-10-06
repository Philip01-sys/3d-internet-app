import { useMemo } from 'react'
import { CatmullRomCurve3, LineCurve3, SphereGeometry, TubeGeometry, Vector3 } from 'three'
import { clay, lumpify } from './clay.js'

// Characters drawn as rolled clay "sausages". Coordinates: x in [0, width],
// y in [0, 1.4] (baseline 0). Each stroke is a list of points; two-point
// strokes are straight, longer ones are smooth curves.
const arc = (cx, cy, rx, ry, a0, a1, n = 10) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]
  })

const GLYPHS = {
  3: { w: 1, strokes: [[[0.12, 1.15], [0.5, 1.38], [0.86, 1.12], [0.52, 0.74], [0.9, 0.38], [0.55, 0.02], [0.1, 0.18]]] },
  4: { w: 1, strokes: [[[0.72, 0], [0.72, 1.4]], [[0.72, 1.4], [0.05, 0.45]], [[0.05, 0.45], [0.95, 0.45]]] },
  7: { w: 1, strokes: [[[0.05, 1.35], [0.95, 1.35]], [[0.95, 1.35], [0.38, 0]]] },
  '+': { w: 1, strokes: [[[0.12, 0.7], [0.88, 0.7]], [[0.5, 0.32], [0.5, 1.08]]] },
  '=': { w: 1, strokes: [[[0.12, 0.92], [0.88, 0.92]], [[0.12, 0.48], [0.88, 0.48]]] },
  Z: { w: 1, strokes: [[[0.1, 1.3], [0.9, 1.3]], [[0.9, 1.3], [0.1, 0.1]], [[0.1, 0.1], [0.9, 0.1]]] },
  '?': { w: 0.9, strokes: [[[0.1, 1.05], [0.25, 1.33], [0.6, 1.38], [0.82, 1.1], [0.45, 0.72], [0.45, 0.45]], [[0.45, 0.08], [0.45, 0.1]]] },
  C: { w: 1.1, strokes: [arc(0.62, 0.7, 0.55, 0.68, 48, 312, 16)] },
  l: { w: 0.35, strokes: [[[0.18, 0], [0.18, 1.4]]] },
  a: { w: 0.95, strokes: [arc(0.42, 0.4, 0.36, 0.4, 0, 360, 16), [[0.8, 0.82], [0.8, 0]]] },
  u: { w: 0.95, strokes: [[[0.1, 0.82], [0.1, 0.3], [0.3, 0.02], [0.6, 0.04], [0.8, 0.35]], [[0.8, 0.82], [0.8, 0]]] },
  d: { w: 0.95, strokes: [arc(0.42, 0.4, 0.36, 0.4, 0, 360, 16), [[0.8, 1.4], [0.8, 0]]] },
  e: { w: 0.9, strokes: [[[0.1, 0.42], [0.78, 0.42], [0.7, 0.72], [0.42, 0.84], [0.12, 0.62], [0.1, 0.22], [0.42, 0.0], [0.76, 0.14]]] },
}

export const glyphWidth = (ch) => GLYPHS[ch].w

const geoCache = new Map()
function glyphGeometries(ch, radius) {
  const k = `${ch}|${radius}`
  if (geoCache.has(k)) return geoCache.get(k)
  const { w, strokes } = GLYPHS[ch]
  const list = []
  strokes.forEach((stroke, si) => {
    const pts = stroke.map(([x, y]) => new Vector3(x - w / 2, y - 0.7, 0))
    const curve = pts.length === 2 ? new LineCurve3(pts[0], pts[1]) : new CatmullRomCurve3(pts, false, 'centripetal')
    const segs = pts.length === 2 ? 8 : 48
    list.push({ geometry: lumpify(new TubeGeometry(curve, segs, radius, 12, false), si + ch.charCodeAt(0), radius * 0.12) })
    // Rounded clay ends
    for (const p of [pts[0], pts[pts.length - 1]]) {
      list.push({ geometry: new SphereGeometry(radius, 12, 10), position: p.toArray() })
    }
  })
  geoCache.set(k, list)
  return list
}

/** A single character modelled from clay coils. Centered on its box. */
export function ClayGlyph({ ch, color, radius = 0.11, material, castShadow = true, ...props }) {
  const parts = useMemo(() => glyphGeometries(ch, radius), [ch, radius])
  const mat = material ?? clay(color)
  return (
    <group {...props}>
      {parts.map((p, i) => (
        <mesh key={i} geometry={p.geometry} position={p.position} material={mat} castShadow={castShadow} receiveShadow />
      ))}
    </group>
  )
}
