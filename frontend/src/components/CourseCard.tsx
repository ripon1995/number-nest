import type {Course} from '../types/course';
import {IoCalendarOutline, IoTimeOutline, IoPeopleOutline} from 'react-icons/io5';
import './CourseCard.css';

interface CourseCardProps {
    course: Course;
}

export default function CourseCard({course}: CourseCardProps) {
    return (
        <div className="course-card">
            <h2 className="course-title">{course.title}</h2>
            <p className="course-description">{course.description}</p>

            <div className="course-details">
                <div className="detail-item">
                    <span className="detail-label">Schedule:</span>
                    <span className="detail-value detail-with-icon">
                        <IoCalendarOutline className="detail-icon"/>
                        {course.batch_days}
                    </span>
                </div>

                <div className="detail-item">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value detail-with-icon">
                        <IoTimeOutline className="detail-icon"/>
                        {new Date(course.batch_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                </div>

                <div className="detail-item">
                    <span className="detail-label">Capacity:</span>
                    <span className="detail-value detail-with-icon">
                        <IoPeopleOutline className="detail-icon"/>
                        {course.capacity} students
                    </span>
                </div>

                <div className="detail-item">
                    <span className="detail-label">Fee:</span>
                    <span className="detail-value course-fee">${course.course_fee}</span>
                </div>
            </div>
        </div>
    );
}