// frontend/src/lib/api/user.ts
import { ProfileInput } from '../schemas/user';
import { apiClient } from './client';

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
  return apiClient<ProfileResponse>('/profile');
}

export async function updateProfile(data: ProfileInput): Promise<ProfileResponse> {
  return apiClient<ProfileResponse>('/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
