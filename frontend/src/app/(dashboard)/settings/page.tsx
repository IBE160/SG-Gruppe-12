'use client';

import { useEffect, useState } from 'react';
import { ProfileForm } from '@/components/features/user/ProfileForm';
import { PrivacySettings } from '@/components/features/user/PrivacySettings';
import { getProfile, updateProfile } from '@/lib/api/user';
import { ProfileInput } from '@/lib/schemas/user';
import { useRouter } from 'next/navigation';

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
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy'>('profile');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setInitialProfileData(response.profile);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile data.';
        setError(errorMessage);
        if (errorMessage.includes('Unauthorized')) {
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeleted = () => {
    router.push('/login?deleted=true');
  };

  if (loading && !initialProfileData) {
    return <LoadingSpinner />;
  }

  if (error && !initialProfileData) {
    return <div className="text-center text-red-500 mt-8">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-center mb-6">Settings</h1>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'privacy'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Privacy & Data
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 max-w-lg mx-auto" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      {activeTab === 'profile' ? (
        <ProfileForm
          initialData={initialProfileData || undefined}
          onSubmit={handleSubmit}
          isLoading={loading}
          error={error}
        />
      ) : (
        <PrivacySettings onAccountDeleted={handleAccountDeleted} />
      )}
    </div>
  );
}
