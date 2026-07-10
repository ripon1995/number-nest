export function niceCeil(value: number): number {
  if (value <= 0) return 1
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const residual = value / magnitude
  let niceResidual: number
  if (residual <= 1) niceResidual = 1
  else if (residual <= 2) niceResidual = 2
  else if (residual <= 5) niceResidual = 5
  else niceResidual = 10
  return niceResidual * magnitude
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Two-slice donut as a conic-gradient: good/critical arcs separated by a
 * surface-colored gap at both boundaries (including the 0/360 seam), so the
 * gap reads as the "surface doing the separating" per the mark spec rather
 * than a stroke drawn around each slice.
 */
export function buildDonutGradient(goodValue: number, total: number, gapDeg = 6): string {
  if (total <= 0) {
    return 'var(--border)'
  }
  const g = gapDeg / 2
  const goodDeg = (goodValue / total) * 360
  const p1 = clamp(g, 0, 360)
  const p2 = clamp(goodDeg - g, p1, 360)
  const p3 = clamp(goodDeg + g, p2, 360)
  const p4 = clamp(360 - g, p3, 360)
  return (
    `conic-gradient(from -90deg, ` +
    `var(--surface) 0deg ${p1}deg, ` +
    `var(--status-good) ${p1}deg ${p2}deg, ` +
    `var(--surface) ${p2}deg ${p3}deg, ` +
    `var(--status-critical) ${p3}deg ${p4}deg, ` +
    `var(--surface) ${p4}deg 360deg)`
  )
}
