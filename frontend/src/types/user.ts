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
  name: string;
  phone_number: string;
  is_admin: boolean;
}

export interface Profile {
  name: string;
  phone_number: string;
  father_name: string | null;
  college: string | null;
  father_contact: string | null;
  email: string | null;
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