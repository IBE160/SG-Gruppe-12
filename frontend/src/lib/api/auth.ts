// frontend/src/lib/api/auth.ts
import { SignupFormValues } from "@/lib/schemas/auth";

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

// You might add login, logout, and token refresh functions here later