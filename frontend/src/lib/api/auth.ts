// frontend/src/lib/api/auth.ts
import { SignupFormValues, LoginFormValues } from "@/lib/schemas/auth"; // Import LoginFormValues

// A utility function to handle API errors consistently
const handleAuthApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }
  return response.json();
};

export const registerUser = async (userData: SignupFormValues) => {
  const response = await fetch("/api/v1/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  return handleAuthApiError(response);
};

export const loginUser = async (credentials: LoginFormValues) => {
  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  return handleAuthApiError(response);
};

export const logoutUser = async () => {
  const response = await fetch("/api/v1/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleAuthApiError(response);
};

export const refreshAccessToken = async () => {
  const response = await fetch("/api/v1/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies
  });
  return handleAuthApiError(response);
};