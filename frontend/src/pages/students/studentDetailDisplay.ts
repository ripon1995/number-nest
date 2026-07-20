import type { Enrollment } from '../../types/enrollment'
import type { Course } from '../../types/course'
import type { Payment } from '../../types/payment'

export interface DuePaymentEntry {
  enrollmentId: string
  courseId: string
  courseName: string
  month: string
  amount: string
}

function currentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function monthsBetweenInclusive(startKey: string, endKey: string): string[] {
  const [startYear, startMonth] = startKey.split('-').map(Number)
  const [endYear, endMonth] = endKey.split('-').map(Number)
  const months: string[] = []
  let year = startYear
  let month = startMonth
  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`)
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }
  return months
}

export function buildDuePayments(
  enrollments: Enrollment[],
  coursesById: Map<string, Course>,
  payments: Payment[],
): DuePaymentEntry[] {
  const currentMonth = currentMonthKey()
  const due: DuePaymentEntry[] = []

  for (const enrollment of enrollments) {
    const course = coursesById.get(enrollment.course_id)
    if (!course) continue

    const paidMonths = new Set(
      payments
        .filter((payment) => payment.enrollment_id === enrollment.id)
        .map((payment) => payment.month.slice(0, 7)),
    )

    const startMonth = enrollment.start_from.slice(0, 7)
    for (const month of monthsBetweenInclusive(startMonth, currentMonth)) {
      if (!paidMonths.has(month)) {
        due.push({
          enrollmentId: enrollment.id,
          courseId: course.id,
          courseName: course.course_name,
          month: `${month}-01`,
          amount: course.course_fee,
        })
      }
    }
  }

  return due.sort((a, b) => a.month.localeCompare(b.month) || a.courseName.localeCompare(b.courseName))
}
