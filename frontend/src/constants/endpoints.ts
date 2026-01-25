const baseUrl: string = import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000';

export const courseListCreateApi: string = `${baseUrl}/course/api/courses/`;
export const registrationApi: string = `${baseUrl}/auth/api/register/`;
export const loginApi: string = `${baseUrl}/auth/api/login/`;
export const profileApi: string = `${baseUrl}/auth/api/me/`;
