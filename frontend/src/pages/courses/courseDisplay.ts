import type { CourseBatchType, CourseClass, CourseDay, CourseSubject } from '../../types/course'

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

export const CLASS_LABELS: Record<CourseClass, string> = {
  hsc: 'HSC',
  ssc: 'SSC',
  admission: 'Admission',
}

export const BATCH_TYPE_LABELS: Record<CourseBatchType, string> = {
  regular: 'Regular',
  course: 'Course',
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

function formatClassTimeCompact(time: string): string {
  const [hourStr, minuteStr] = time.split(':')
  const hour24 = Number(hourStr)
  const minute = Number(minuteStr)
  const period = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return minute === 0 ? `${hour12}${period}` : `${hour12}${String(minute).padStart(2, '0')}${period}`
}

// Mirrors the backend's build_course_name (app/courses/naming.py) so the form can preview
// the generated course_name before submitting.
export function buildCourseName(
  classLevel: CourseClass,
  subject: CourseSubject,
  examYear: number | string,
  classTime: string,
  batchType: CourseBatchType,
): string {
  if (!classTime || !examYear) return ''
  return `${classLevel.toUpperCase()}-${subject.toUpperCase()}-${examYear}-${formatClassTimeCompact(classTime)}-${BATCH_TYPE_LABELS[batchType]}`
}
