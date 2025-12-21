const baseUrl: string = import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000';

export const courseListApi: string = `${baseUrl}/course/api/courses/`;
export const registrationApi: string = `${baseUrl}/auth/api/register/`;
