import type { Student } from './student'

export type CourseClass = 'hsc' | 'ssc' | 'admission'

export const COURSE_CLASSES: CourseClass[] = ['hsc', 'ssc', 'admission']

export type CourseSubject = 'math' | 'ict'

export const COURSE_SUBJECTS: CourseSubject[] = ['math', 'ict']

export type CourseBatchType = 'regular' | 'course'

export const COURSE_BATCH_TYPES: CourseBatchType[] = ['regular', 'course']

export type CourseDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export const COURSE_DAYS: CourseDay[] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']

export interface Course {
  id: string
  course_name: string
  class_level: CourseClass
  subject: CourseSubject
  exam_year: number
  class_time: string
  batch_type: CourseBatchType
  course_fee: string
  enrollment_fee: string
  course_days: CourseDay[]
  capacity: number
  course_motto: string | null
  note: string | null
}

export interface CourseInput {
  class_level: CourseClass
  subject: CourseSubject
  exam_year: number
  class_time: string
  batch_type: CourseBatchType
  course_fee: string
  enrollment_fee: string
  course_days: CourseDay[]
  capacity: number
  course_motto: string | null
  note: string | null
}

export interface CourseDetail extends Course {
  students: Student[]
}
