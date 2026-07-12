import type { CourseDay, CourseSubject } from '../../types/course'

export const DAY_LABELS: Record<CourseDay, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
}

export const SUBJECT_LABELS: Record<CourseSubject, string> = {
  math: 'Math',
  ict: 'ICT',
}

export function formatFee(fee: string): string {
  return String(Math.round(Number(fee)))
}

export function formatDays(days: CourseDay[]): string {
  return days.map((day) => DAY_LABELS[day]).join(', ')
}

export function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(':')
  const hour24 = Number(hourStr)
  const period = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${hour12}:${minuteStr} ${period}`
}
