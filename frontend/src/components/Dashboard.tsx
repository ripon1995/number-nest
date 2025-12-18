import {useEffect} from 'react';
import './Dashboard.css';
import {useCourseStore} from '../store/useCourseStore';

export default function Dashboard() {
    const {courses, loading, error, fetchCourses} = useCourseStore();

    useEffect((): void => {
        fetchCourses().then(_r => {
        });
    }, [fetchCourses]);

    if (loading) {
        return (
            <div className="dashboard">
                <div className="loading">Loading courses...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard">
                <div className="error">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <h1>Available Courses</h1>

            {courses.length === 0 ? (
                <div className="no-courses">No courses available at the moment.</div>
            ) : (
                <div className="courses-grid">
                    {courses.map((course) => (
                        <div key={course.id} className="course-card">
                            <h2 className="course-title">{course.title}</h2>
                            <p className="course-description">{course.description}</p>

                            <div className="course-details">
                                <div className="detail-item">
                                    <span className="detail-label">Schedule:</span>
                                    <span className="detail-value">{course.batch_days}</span>
                                </div>

                                <div className="detail-item">
                                    <span className="detail-label">Time:</span>
                                    <span className="detail-value">
                    {new Date(course.batch_time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                  </span>
                                </div>

                                <div className="detail-item">
                                    <span className="detail-label">Capacity:</span>
                                    <span className="detail-value">{course.capacity} students</span>
                                </div>

                                <div className="detail-item">
                                    <span className="detail-label">Fee:</span>
                                    <span className="detail-value course-fee">${course.course_fee}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}