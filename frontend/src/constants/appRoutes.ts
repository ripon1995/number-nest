export const AppRoutes = {
    LOGIN: '/',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    COURSE_DETAILS: '/course/:id',
    COURSE_PLAN: '/course/:id/course-plan',
    COURSE_ROUTINE: '/course/:id/course-routine',
    ENROLLED_STUDENTS: '/course/:id/enrolled-students',
    COURSE_ATTENDANCE: '/course/:id/course-attendance',
    EXAM_SCHEDULE: '/course/:id/exam-schedule',
    COURSE_PAYMENT: '/course/:id/course-payment',
    COURSE_NOTE: '/course/:id/course-notes',
    PROFILE: '/profile',
    // Helper to generate the course detail URL
    getCoursePath: (id: string) => '/course/' + id,
    getCoursePlanPath: (id: string) => `/course/${id}/course-plan`
} as const;


export const PathName = {
    PATH_COURSE_PLAN: 'course-plan'
}