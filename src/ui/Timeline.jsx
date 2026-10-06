import { STATIONS, TRAVEL_SECONDS } from '../stations.js'

const ICONS = {
  laptop: (
    <path d="M4 5h16v10H4zM2 18h20l-1.5 2h-17z" />
  ),
  router: (
    <path d="M3 13h18v6H3zM7 13 5 5M12 13V4M17 13l2-8M6.5 16h.01M10 16h.01" />
  ),
  fiber: (
    <path d="M2 8c5 0 5 8 10 8s5-8 10-8M2 12h20M2 16c5 0 5-8 10-8s5 8 10 8" />
  ),
  server: (
    <path d="M5 3h14v5H5zM5 10h14v5H5zM5 17h14v4H5zM8 5.5h.01M8 12.5h.01" />
  ),
}

function Icon({ id }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[id]}
    </svg>
  )
}

export default function Timeline({ station, onSelect, playing, onTogglePlay }) {
  const last = STATIONS.length - 1
  const progress = (station / last) * 100

  return (
    <nav className="timeline" aria-label="Request journey">
      <button type="button" className="ctrl" onClick={() => onSelect(Math.max(0, station - 1))} disabled={station === 0} aria-label="Previous station">
        ‹
      </button>

      <div className="track">
        <div className="rail">
          <div className="fill" style={{ width: `${progress}%`, transitionDuration: `${TRAVEL_SECONDS}s` }}>
            <span className="spark" />
          </div>
        </div>
        <ol className="stops">
          {STATIONS.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={`stop${i === station ? ' current' : ''}${i < station ? ' done' : ''}`}
                onClick={() => onSelect(i)}
                aria-current={i === station ? 'step' : undefined}
              >
                <span className="dot">
                  <Icon id={s.id} />
                </span>
                <span className="stop-name">{s.name}</span>
                <span className="stop-role">{s.role}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <button type="button" className="ctrl" onClick={() => onSelect(Math.min(last, station + 1))} disabled={station === last} aria-label="Next station">
        ›
      </button>
      <button type="button" className="ctrl play" onClick={onTogglePlay} aria-label={playing ? 'Pause tour' : 'Play tour'}>
        {playing ? '❚❚' : '▶'}
      </button>
    </nav>
  )
}
