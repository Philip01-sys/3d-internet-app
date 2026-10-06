import { useState } from 'react'
import { STATIONS } from '../stations.js'

export default function InfoPanel({ station }) {
  // Start collapsed on phones so the scene stays visible.
  const [open, setOpen] = useState(() => window.innerWidth > 760)
  const s = STATIONS[station]

  return (
    <aside className={`info${open ? '' : ' collapsed'}`} aria-live="polite">
      <header>
        <div>
          <p className="eyebrow">
            Step {station + 1} of {STATIONS.length} · {s.layer}
          </p>
          <h2>{s.title}</h2>
        </div>
        <button type="button" className="collapse" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Hide details' : 'Show details'}>
          {open ? '−' : '+'}
        </button>
      </header>

      {open && (
        <div key={s.id} className="info-body">
          <p className="lead">{s.lead}</p>
          <ul>
            {s.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          <h3>Packet header here</h3>
          <dl className="header-table">
            {Object.entries(s.header).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <div className="legend">
            <span><i style={{ '--c': '#4de1ff' }} /> Request</span>
            <span><i style={{ '--c': '#ffb347' }} /> Response</span>
            <span><i style={{ '--c': '#c9d6ff' }} /> Electrical signal</span>
            <span><i style={{ '--c': '#ff4de1' }} /> 2nd wavelength</span>
          </div>
        </div>
      )}
    </aside>
  )
}
