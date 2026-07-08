export type CourseSubject = 'math' | 'ict'

export const COURSE_SUBJECTS: CourseSubject[] = ['math', 'ict']

export type CourseDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export const COURSE_DAYS: CourseDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export interface Course {
  id: string
  course_name: string
  course_fee: string
  subject: CourseSubject
  course_days: CourseDay[]
  capacity: number
  course_motto: string | null
}

export interface CourseInput {
  course_name: string
  course_fee: string
  subject: CourseSubject
  course_days: CourseDay[]
  capacity: number
  course_motto: string | null
}
