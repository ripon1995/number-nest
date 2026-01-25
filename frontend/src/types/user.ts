export interface RegistrationData {
  name: string;
  phone_number: string;
  password: string;
}

export interface LoginData {
  phone_number: string;
  password: string;
}

export interface User {
  id?: string;
  name: string;
  phone_number: string;
  is_admin: boolean;
  profile_created?: boolean;
  password?: string;
}

export interface StudentProfile {
  id: string;
  father_name: string;
  father_contact: string;
  college: string;
  email: string;
  user: User;
  course?: {
    id: string;
    title: string;
    description: string;
    batch_days: string;
    batch_time: string;
    capacity: number;
    course_fee: string;
    speech: string;
  };
}

export interface Profile {
  name: string;
  phone_number: string;
  father_name: string | null;
  college: string | null;
  father_contact: string | null;
  email: string | null;
}

export interface StudentProfileCreateData {
  father_name: string;
  father_contact: string;
  college: string;
  email: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, any>;
}