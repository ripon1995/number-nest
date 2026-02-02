const baseUrl: string = import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000';

export const courseListCreateApi: string = `${baseUrl}/course/api/courses/`;
export const getCourseDetailApi = (courseId: string): string => `${baseUrl}/course/api/course/${courseId}/`;
export const registrationApi: string = `${baseUrl}/auth/api/register/`;
export const loginApi: string = `${baseUrl}/auth/api/login/`;
export const profileApi: string = `${baseUrl}/auth/api/me/`;
export const studentProfileCreateApi: string = `${baseUrl}/student/api/profiles/`;
export const getStudentProfileApi = (userId: string): string => `${baseUrl}/student/api/profile/${userId}/`;
export const courseEnrollmentApi: string = `${baseUrl}/student/api/enroll-course/`;