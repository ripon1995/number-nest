export const AppRoutes = {
    LOGIN: '/',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    ENROLLED_STUDENTS: '/enrolled-students',
    COURSE_DETAILS: '/course/:id',
    // Helper to generate the URL
    getCoursePath: (id: string) => '/course/' + id
} as const;