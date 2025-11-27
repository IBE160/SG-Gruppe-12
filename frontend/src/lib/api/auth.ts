// frontend/src/lib/api/auth.ts
import { SignupFormValues, LoginFormValues } from "@/lib/schemas/auth";
import { apiClient } from "./client";

interface AuthResponse {
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
}

export const registerUser = async (userData: SignupFormValues): Promise<AuthResponse> => {
  return apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (credentials: LoginFormValues): Promise<AuthResponse> => {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

export const logoutUser = async (): Promise<AuthResponse> => {
  return apiClient<AuthResponse>("/auth/logout", {
    method: "POST",
  });
};

export const refreshAccessToken = async (): Promise<AuthResponse> => {
  return apiClient<AuthResponse>("/auth/refresh", {
    method: "POST",
  });
};