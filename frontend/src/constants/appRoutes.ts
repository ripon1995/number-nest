export const AppRoutes = {
    LOGIN: '/',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    COURSE_DETAILS: '/course/:id',
    PROFILE: '/profile',
    // Helper to generate the URL
    getCoursePath: (id: string) => '/course/' + id
} as const;