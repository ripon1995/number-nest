import {useOutletContext} from 'react-router-dom';
import type {Course} from '../../types/course';

export const CourseInfoView = () => {
    const {course} = useOutletContext<{ course: Course | undefined }>();

    if (!course) return <p>No course data found.</p>;

    return (
        <div className="course-info">
            <h1>Course Details</h1>
            <p><strong>Title:</strong> {course.title}</p>
            <p><strong>Description:</strong> {course.description}</p>
            <p><strong>Batch Days:</strong> {course.batch_days}</p>
            {/* ... other fields ... */}
        </div>
    );
};