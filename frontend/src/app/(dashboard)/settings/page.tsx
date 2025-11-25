'use client';

import { useEffect, useState } from 'react';
import { ProfileForm } from '../../components/features/user/ProfileForm';
import { getProfile, updateProfile } from '../../lib/api/user';
import { ProfileInput } from '../../lib/schemas/user';
import { useRouter } from 'next/navigation'; // For redirection after login if needed

// Optional: Add a loading spinner or skeleton
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

export default function SettingsPage() {
  const [initialProfileData, setInitialProfileData] = useState<ProfileInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setInitialProfileData(response.profile);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile data.');
        // Potentially redirect to login if unauthorized
        if (err.message && err.message.includes('Unauthorized')) {
            router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleSubmit = async (data: ProfileInput) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await updateProfile(data);
      setSuccessMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !initialProfileData) {
    return <LoadingSpinner />;
  }

  if (error && !initialProfileData) {
    return <div className="text-center text-red-500 mt-8">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      <ProfileForm initialData={initialProfileData || undefined} onSubmit={handleSubmit} isLoading={loading} error={error} />
    </div>
  );
}
