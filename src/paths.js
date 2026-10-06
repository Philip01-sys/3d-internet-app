import { CatmullRomCurve3, Vector3 } from 'three'

// All cable routes are defined once here so the cables, the light pulses and
// the travelling packet share exactly the same geometry.

const v = (x, y, z) => new Vector3(x, y, z)

// Copper Ethernet: laptop (on the desk) -> floor -> router (on its shelf).
const ETHERNET_POINTS = [
  v(-14.75, 1.06, 1.0),
  v(-14.3, 1.02, 1.0),
  v(-14.0, 0.55, 0.9),
  v(-13.6, 0.06, 0.6),
  v(-11.0, 0.06, 0.0),
  v(-9.4, 0.06, -0.8),
  v(-9.05, 0.5, -1.0),
  v(-8.85, 0.95, -1.0),
]

// Fibre optic run: router -> ground trench -> data-centre rack.
const FIBER_POINTS = [
  v(-7.15, 0.95, -1.0),
  v(-6.8, 0.5, -1.0),
  v(-6.3, 0.08, -0.6),
  v(-3.0, 0.08, 0.6),
  v(2.0, 0.08, 1.0),
  v(7.0, 0.08, 0.4),
  v(11.0, 0.08, -0.3),
  v(13.6, 0.08, -0.5),
  v(14.0, 0.6, -0.5),
  v(14.4, 1.4, -0.5),
]

const curve = (points) => new CatmullRomCurve3(points, false, 'centripetal')

export const ethernetCurve = curve(ETHERNET_POINTS)

// Three parallel fibre strands, offset sideways from the centre line.
export const fiberCurves = [-0.11, 0, 0.11].map((dz, i) =>
  curve(FIBER_POINTS.map((p) => p.clone().add(v(0, i === 1 ? 0.07 : 0, dz)))),
)
export const fiberCenterCurve = curve(FIBER_POINTS)

// The full journey of the request packet: inside the laptop -> through the
// router -> along the fibre -> into the server.
export const journeyCurve = curve([
  v(-16.0, 1.35, 0.85),
  v(-15.3, 1.15, 1.0),
  ...ETHERNET_POINTS,
  v(-8.0, 1.6, -0.85), // hop over the router, where it is visible
  ...FIBER_POINTS,
  v(14.85, 1.55, 0.3), // rest in front of the rack's network port
])

/** Arc-length parameter (0..1) of the point on `c` closest to `target`. */
export function closestU(c, target, samples = 600) {
  let best = 0
  let bestD = Infinity
  const p = new Vector3()
  for (let i = 0; i <= samples; i++) {
    const u = i / samples
    c.getPointAt(u, p)
    const d = p.distanceToSquared(target)
    if (d < bestD) {
      bestD = d
      best = u
    }
  }
  return best
}

/** Build a sub-curve of `c` between arc-length params u0..u1. */
export function subCurve(c, u0, u1, n = 24) {
  const pts = []
  for (let i = 0; i <= n; i++) pts.push(c.getPointAt(u0 + ((u1 - u0) * i) / n))
  return curve(pts)
}
