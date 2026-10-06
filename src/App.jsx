import { useCallback, useEffect, useState } from 'react'
import Scene from './scene/Scene.jsx'
import Timeline from './ui/Timeline.jsx'
import InfoPanel from './ui/InfoPanel.jsx'
import { STATIONS, TRAVEL_SECONDS } from './stations.js'

const AUTOPLAY_DWELL = 4.5 // seconds spent at each station after arriving
const LAST = STATIONS.length - 1

export default function App() {
  const [station, setStation] = useState(0)
  const [overview, setOverview] = useState(false)
  const [playing, setPlaying] = useState(false)

  const select = useCallback((i) => {
    setOverview(false)
    setStation(i)
  }, [])

  const togglePlay = useCallback(() => {
    // Replaying from the end restarts the tour.
    if (!playing && station === LAST) setStation(0)
    setPlaying(!playing)
    setOverview(false)
  }, [playing, station])

  // Auto-advance through the stations while playing.
  useEffect(() => {
    if (!playing) return
    if (station === LAST) {
      const id = setTimeout(() => setPlaying(false), (TRAVEL_SECONDS + AUTOPLAY_DWELL) * 1000)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => setStation((s) => Math.min(LAST, s + 1)), (TRAVEL_SECONDS + AUTOPLAY_DWELL) * 1000)
    return () => clearTimeout(id)
  }, [playing, station])

  // Keyboard: ← / → to step, space to play/pause, O for overview.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return
      if (e.key === 'ArrowRight') select(Math.min(LAST, station + 1))
      else if (e.key === 'ArrowLeft') select(Math.max(0, station - 1))
      else if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      } else if (e.key.toLowerCase() === 'o') setOverview((o) => !o)
      else if (/^[1-4]$/.test(e.key)) select(Number(e.key) - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [station, select, togglePlay])

  return (
    <div className="app">
      <Scene station={station} overview={overview} onSelect={select} />

      <header className="title">
        <h1>Journey of a Network Request</h1>
        <p>Follow one HTTP request from your laptop to a server and back.</p>
      </header>

      <button type="button" className={`overview-btn${overview ? ' on' : ''}`} onClick={() => setOverview((o) => !o)}>
        {overview ? 'Back to station' : 'Overview'}
      </button>

      <InfoPanel station={station} />
      <Timeline station={station} onSelect={select} playing={playing} onTogglePlay={togglePlay} />

      <p className="hint">← → to step · Space to play · Click objects or labels · O for overview</p>
    </div>
  )
}
