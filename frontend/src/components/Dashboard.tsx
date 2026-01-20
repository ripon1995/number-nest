import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import './Dashboard.css';
import {useCourseStore} from '../store/useCourseStore';
import Logo from './Logo';
import CourseCard from './CourseCard';

export default function Dashboard() {
    const {courses, loading, error, fetchCourses} = useCourseStore();
    const navigate = useNavigate();

    useEffect(() => {
        const abortController = new AbortController();

        fetchCourses(abortController.signal).then(_r => {
        });

        return () => {
            abortController.abort();
        };
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
            <div className="page-header">
                <Logo/>
                <button
                    className="register-button"
                    onClick={() => navigate('/login')}
                >
                    Login
                </button>
            </div>
            <h1>Available Courses</h1>

            {courses.length === 0 ? (
                <div className="no-courses">No courses available at the moment.</div>
            ) : (
                <div className="courses-grid">
                    {courses.map((course) => (
                        <CourseCard key={course.id} course={course}/>
                    ))}
                </div>
            )}
        </div>
    );
}