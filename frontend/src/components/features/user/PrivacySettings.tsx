'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Separator } from '../../ui/separator';
import {
  getConsents,
  updateConsents,
  getDataSummary,
  exportUserData,
  deleteAccount,
  ConsentPreferences,
  DataSummary,
} from '@/lib/api/gdpr';

interface PrivacySettingsProps {
  onAccountDeleted?: () => void;
}

export function PrivacySettings({ onAccountDeleted }: PrivacySettingsProps) {
  const [consents, setConsents] = useState<ConsentPreferences | null>(null);
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [consentData, summaryData] = await Promise.all([
          getConsents(),
          getDataSummary(),
        ]);
        setConsents(consentData);
        setDataSummary(summaryData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load privacy settings';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleConsentChange = async (field: 'aiTraining' | 'marketing', value: boolean) => {
    if (!consents) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateConsents({ [field]: value });
      setConsents(updated);
      setSuccess('Consent preferences updated successfully');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update consent';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await exportUserData();
      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess('Data exported successfully');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMessage);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError(null);

    try {
      await deleteAccount();
      onAccountDeleted?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete account';
      setError(errorMessage);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Consent Preferences */}
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Privacy & Consent</CardTitle>
          <CardDescription>
            Manage how your data is used. You can change these settings at any time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              {success}
            </div>
          )}

          <div className="flex items-start space-x-3">
            <Checkbox
              id="essential"
              checked={consents?.essential ?? true}
              disabled={true}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="essential" className="font-medium">
                Essential Services
              </Label>
              <p className="text-sm text-gray-500">
                Required for the app to function. Cannot be disabled.
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start space-x-3">
            <Checkbox
              id="aiTraining"
              checked={consents?.aiTraining ?? false}
              disabled={saving}
              onCheckedChange={(checked) => handleConsentChange('aiTraining', checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="aiTraining" className="font-medium">
                AI Training & Improvement
              </Label>
              <p className="text-sm text-gray-500">
                Allow anonymized data to be used for improving our AI models.
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start space-x-3">
            <Checkbox
              id="marketing"
              checked={consents?.marketing ?? false}
              disabled={saving}
              onCheckedChange={(checked) => handleConsentChange('marketing', checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="marketing" className="font-medium">
                Marketing Communications
              </Label>
              <p className="text-sm text-gray-500">
                Receive updates about new features and promotions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Summary */}
      {dataSummary && (
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle className="text-xl">Your Data</CardTitle>
            <CardDescription>
              Summary of data we store about you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">CVs</p>
                <p className="font-medium">{dataSummary.dataCounts.cvs}</p>
              </div>
              <div>
                <p className="text-gray-500">CV Components</p>
                <p className="font-medium">{dataSummary.dataCounts.cvComponents}</p>
              </div>
              <div>
                <p className="text-gray-500">Job Postings</p>
                <p className="font-medium">{dataSummary.dataCounts.jobPostings}</p>
              </div>
              <div>
                <p className="text-gray-500">Applications</p>
                <p className="font-medium">{dataSummary.dataCounts.applications}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Member since: {new Date(dataSummary.memberSince).toLocaleDateString()}
            </p>

            <Separator />

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleExportData}
                disabled={exporting}
              >
                {exporting ? 'Exporting...' : 'Export My Data'}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Download all your data in JSON format (GDPR Right to Access)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Account */}
      <Card className="mx-auto max-w-lg border-red-200">
        <CardHeader>
          <CardTitle className="text-xl text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete My Account
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                <p className="font-medium">Are you sure?</p>
                <p className="text-sm mt-1">
                  This action cannot be undone. All your CVs, applications, and personal data will be permanently deleted.
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete Everything'}
                </Button>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-500 text-center mt-2">
            GDPR Right to be Forgotten
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
