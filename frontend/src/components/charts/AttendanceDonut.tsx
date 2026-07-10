import { buildDonutGradient } from './chartMath'
import './charts.css'

interface AttendanceDonutProps {
  title: string
  present: number
  absent: number
  emptyMessage: string
}

function AttendanceDonut({ title, present, absent, emptyMessage }: AttendanceDonutProps) {
  const total = present + absent
  const presentPct = total > 0 ? Math.round((present / total) * 100) : 0

  return (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>

      {total === 0 ? (
        <p className="chart-empty">{emptyMessage}</p>
      ) : (
        <div className="donut-layout">
          <div className="donut-ring" style={{ background: buildDonutGradient(present, total) }}>
            <div className="donut-hole">
              <span className="donut-hole-value">{presentPct}%</span>
              <span className="donut-hole-label">present</span>
            </div>
          </div>

          <ul className="chart-legend" aria-label={`${title} breakdown`}>
            <li tabIndex={0} title={`Present: ${present} of ${total} (${presentPct}%)`}>
              <span className="chart-legend-swatch chart-legend-swatch--good" aria-hidden="true" />
              <span className="chart-legend-label">Present</span>
              <span className="chart-legend-value">
                {present} · {presentPct}%
              </span>
            </li>
            <li tabIndex={0} title={`Absent: ${absent} of ${total} (${100 - presentPct}%)`}>
              <span className="chart-legend-swatch chart-legend-swatch--critical" aria-hidden="true" />
              <span className="chart-legend-label">Absent</span>
              <span className="chart-legend-value">
                {absent} · {100 - presentPct}%
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default AttendanceDonut
