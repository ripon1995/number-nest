const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })

export function formatMonth(month: string): string {
  return MONTH_FORMATTER.format(new Date(`${month}T00:00:00`))
}

export function formatAmount(amount: string): string {
  return String(Math.round(Number(amount)))
}

export function monthInputToApi(value: string): string {
  return `${value}-01`
}
