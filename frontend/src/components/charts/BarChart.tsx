import { niceCeil } from './chartMath'
import './charts.css'

export interface BarDatum {
  key: string
  label: string
  value: number
  tooltip: string
}

interface BarChartProps {
  title: string
  data: BarDatum[]
  color?: string
  emptyMessage: string
}

function BarChart({ title, data, color = 'var(--accent)', emptyMessage }: BarChartProps) {
  const niceMax = niceCeil(Math.max(...data.map((d) => d.value), 1))
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f))

  return (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>

      {data.length === 0 ? (
        <p className="chart-empty">{emptyMessage}</p>
      ) : (
        <div className="bar-chart-plot">
          <div className="bar-chart-gridlines">
            {ticks.map((tick) => (
              <div key={tick} className="bar-chart-gridline" style={{ bottom: `${(tick / niceMax) * 100}%` }}>
                <span>{tick}</span>
              </div>
            ))}
          </div>
          <div className="bar-chart-bars">
            {data.map((d) => (
              <div className="bar-chart-col" key={d.key} tabIndex={0} title={d.tooltip}>
                <span className="bar-chart-value">{d.value}</span>
                <div className="bar-chart-track">
                  <div
                    className="bar-chart-bar"
                    style={{ height: `${(d.value / niceMax) * 100}%`, background: color }}
                  />
                </div>
                <span className="bar-chart-label">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default BarChart
