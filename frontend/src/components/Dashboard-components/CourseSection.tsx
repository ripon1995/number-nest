import type {Course} from '../../types/course';
import CourseCard from '../CourseCard';

interface CourseSectionProps {
    courses: Course[];
    onCourseClick: (course: Course) => void;
}

export const CourseSection = ({courses, onCourseClick}: CourseSectionProps) => (
    <section className="course-section">
        <h1>Available Courses</h1>
        {courses.length === 0 ? (
            <div className="no-courses">No courses available at the moment.</div>
        ) : (
            <div className="courses-grid">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className="course-card-wrapper"
                        onClick={() => onCourseClick(course)}
                    >
                        <CourseCard course={course}/>
                    </div>
                ))}
            </div>
        )}
    </section>
);