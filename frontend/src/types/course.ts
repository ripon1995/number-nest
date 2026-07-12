import type { Student } from './student'

export type CourseSubject = 'math' | 'ict'

export const COURSE_SUBJECTS: CourseSubject[] = ['math', 'ict']

export type CourseDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export const COURSE_DAYS: CourseDay[] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']

export interface Course {
  id: string
  course_name: string
  course_fee: string
  enrollment_fee: string
  subject: CourseSubject
  course_days: CourseDay[]
  class_time: string
  capacity: number
  course_motto: string | null
  note: string | null
}

export interface CourseInput {
  course_name: string
  course_fee: string
  enrollment_fee: string
  subject: CourseSubject
  course_days: CourseDay[]
  class_time: string
  capacity: number
  course_motto: string | null
  note: string | null
}

export interface CourseDetail extends Course {
  students: Student[]
}
