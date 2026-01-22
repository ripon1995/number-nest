export const AppRoutes = {
    LOGIN: '/',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    COURSE_DETAILS: '/course/:id',
    // Helper to generate the URL
    getCoursePath: (id: string) => '/course/' + id
} as const;