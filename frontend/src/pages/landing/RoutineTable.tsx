import type { Course } from '../../types/course'
import { DAY_LABELS, formatTime } from '../courses/courseDisplay'
import { sortCourseDays } from './landingDisplay'

interface RoutineTableProps {
  course: Course
}

function RoutineTable({ course }: RoutineTableProps) {
  const days = sortCourseDays(course.course_days)

  return (
    <div className="routine">
      <div className="routine-table-wrap">
        <table className="routine-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td>{DAY_LABELS[day]}</td>
                <td>{formatTime(course.class_time)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {course.note && <p className="routine-note">{course.note}</p>}
    </div>
  )
}

export default RoutineTable
