// frontend/src/lib/api/user.ts
import { ProfileInput } from '../schemas/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

interface ProfileResponse {
  profile: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
  message?: string;
}

export async function getProfile(): Promise<ProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch profile');
  }

  return response.json();
}

export async function updateProfile(data: ProfileInput): Promise<ProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update profile');
  }

  return response.json();
}
