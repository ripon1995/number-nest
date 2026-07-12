import { COURSE_DAYS } from '../../types/course'
import type { CourseDay } from '../../types/course'

export function sortCourseDays(days: CourseDay[]): CourseDay[] {
  return [...days].sort((a, b) => COURSE_DAYS.indexOf(a) - COURSE_DAYS.indexOf(b))
}
