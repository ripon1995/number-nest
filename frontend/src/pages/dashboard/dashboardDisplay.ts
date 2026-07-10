const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const DATETIME_FORMATTER = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })

export function formatShortDate(value: string): string {
  return SHORT_DATE_FORMATTER.format(new Date(value))
}

export function formatDateTime(value: string): string {
  return DATETIME_FORMATTER.format(new Date(value))
}
