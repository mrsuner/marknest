'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { env } from '@/lib/config/env';

interface DocumentShareInfo {
  share_token: string;
  is_active: boolean;
  access_level: string;
}

export default function DocumentRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const documentId = params.id as string;

  useEffect(() => {
    const findActiveShare = async () => {
      try {
        // Try to find an active public share for this document
        const response = await fetch(`${env.API_BASE_URL}/api/documents/${documentId}/active-share`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const shareInfo: DocumentShareInfo = await response.json();
          // Redirect to the share URL
          router.replace(`/share/${shareInfo.share_token}`);
        } else if (response.status === 404) {
          setError('This document is not publicly shared or the share link has expired.');
        } else {
          setError('Unable to access document.');
        }
      } catch (err) {
        setError('Failed to load document.');
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      findActiveShare();
    }
  }, [documentId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base-content/60">Redirecting to document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100 flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl w-full max-w-md">
          <div className="card-body text-center">
            <div className="text-error mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="card-title justify-center text-error">Access Denied</h2>
            <p className="text-base-content/60 mb-4">{error}</p>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => router.push('/')}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}