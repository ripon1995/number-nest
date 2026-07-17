const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' })

export function formatSessionDate(sessionDate: string): string {
  return DATE_FORMATTER.format(new Date(`${sessionDate}T00:00:00`))
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}
