// frontend/src/components/features/cv-management/CVVersionHistory.tsx
import React, { useState, useEffect } from 'react';
import { useCvStore } from '@/store/cvStore';
import * as api from '@/lib/api/cv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { History, RotateCcw } from 'lucide-react';

interface CVVersionHistoryProps {
  cvId: string;
}

const CVVersionHistory: React.FC<CVVersionHistoryProps> = ({ cvId }) => {
  const { toast } = useToast();
  const setCV = useCvStore((state) => state.setCV);
  const [versions, setVersions] = useState<{ versionNumber: number; createdAt: string }[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [activeVersion, setActiveVersion] = useState<number | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      setIsListLoading(true);
      try {
        const fetchedVersions = await api.listCvVersions(cvId);
        setVersions(fetchedVersions);
        setActiveVersion(fetchedVersions.length > 0 ? fetchedVersions[fetchedVersions.length - 1].versionNumber : null);
      } catch (e: any) {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
      } finally {
        setIsListLoading(false);
      }
    };
    fetchVersions();
  }, [cvId, toast]);

  const handleViewVersion = async (versionNumber: number) => {
    setLoadingAction(`view-${versionNumber}`);
    try {
      const versionData = await api.getCvVersionDetails(cvId, versionNumber);
      setCV(versionData);
      setActiveVersion(versionNumber);
      toast({ title: 'Success', description: `Viewing Version ${versionNumber}.` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRestoreVersion = async (versionNumber: number) => {
    if (!window.confirm(`Are you sure you want to restore to Version ${versionNumber}? This will overwrite your current CV.`)) {
      return;
    }
    setLoadingAction(`restore-${versionNumber}`);
    try {
      const restoredCv = await api.restoreCvVersion(cvId, versionNumber);
      setCV(restoredCv);
      toast({ title: 'Success', description: `CV restored to Version ${versionNumber}.` });
      
      // Re-fetch versions to update the list
      setIsListLoading(true);
      const fetchedVersions = await api.listCvVersions(cvId);
      setVersions(fetchedVersions);
      setActiveVersion(fetchedVersions.length > 0 ? fetchedVersions[fetchedVersions.length - 1].versionNumber : null);

    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoadingAction(null);
      setIsListLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CV Version History</CardTitle>
        <CardDescription>Browse and restore previous versions of your CV.</CardDescription>
      </CardHeader>
      <CardContent>
        {isListLoading && !versions.length && <p>Loading versions...</p>}
        {!isListLoading && versions.length === 0 && <p>No versions available.</p>}
        <div className="space-y-3">
          {versions.map((version) => (
            <div key={version.versionNumber} className={`flex justify-between items-center p-3 border rounded-md ${activeVersion === version.versionNumber ? 'bg-blue-50 border-blue-400' : 'bg-gray-50'}`}>
              <div>
                <p className="font-semibold">Version {version.versionNumber}</p>
                <p className="text-sm text-gray-600">{new Date(version.createdAt).toLocaleString()}</p>
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleViewVersion(version.versionNumber)} disabled={loadingAction === `view-${version.versionNumber}`} aria-label={`View Version ${version.versionNumber}`}>
                  View
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleRestoreVersion(version.versionNumber)} disabled={loadingAction === `restore-${version.versionNumber}`} aria-label={`Restore Version ${version.versionNumber}`}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Restore
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CVVersionHistory;
