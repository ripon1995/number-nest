import type {Course} from '../../types/course';
import CourseCard from '../CourseCard';
import './CourseSection.css';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import {colors} from '../../utils/colors';

interface CourseSectionProps {
    courses: Course[];
    onCourseClick: (course: Course) => void;
    onAddCourseClick: () => void;
}

export const CourseSection = ({courses, onCourseClick, onAddCourseClick}: CourseSectionProps) => (
    <section>
        <div className="section-header">
            <h1>Available Courses</h1>
            <Button
                variant="contained"
                startIcon={<AddIcon/>}
                onClick={onAddCourseClick}
                sx={{
                    background: colors.primary.gradient,
                    color: colors.neutral.white,
                    fontWeight: 600,
                    '&:hover': {
                        background: colors.primary.gradient,
                        opacity: 0.9,
                    },
                }}
            >
                Add Course
            </Button>

        </div>
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