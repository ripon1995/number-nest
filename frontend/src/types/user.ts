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