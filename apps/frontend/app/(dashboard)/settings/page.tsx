'use client';

import { useEffect, useState } from 'react';
import { env } from '@/lib/config/env';

interface UserStats {
  id: string;
  name: string;
  email: string;
  plan: string;
  storage_used: number;
  storage_limit: number;
  document_count: number;
  document_limit: number;
  version_history_days: number;
  can_share_public: boolean;
  can_password_protect: boolean;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return 'progress-error';
  if (percentage >= 70) return 'progress-warning';
  return 'progress-primary';
};

export default function SettingsPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        const response = await fetch(`${env.API_BASE_URL}/api/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const storagePercentage = userStats ? Math.round((userStats.storage_used / userStats.storage_limit) * 100) : 0;
  const documentsPercentage = userStats ? Math.round((userStats.document_count / userStats.document_limit) * 100) : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-base-300 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-40 bg-base-300 rounded-xl"></div>
            <div className="h-40 bg-base-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">Settings & Upgrade</h1>
          <p className="text-base-content/60">Manage your account settings and upgrade your plan</p>
        </div>

        {/* Current Plan & Stats */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-base-content">Your Current Plan</h2>
            <div className="badge badge-primary badge-lg font-medium">
              {userStats?.plan?.toUpperCase() || 'FREE'}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Storage Usage */}
            <div className="bg-base-100 border border-base-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-base-content">Storage Usage</h3>
                  <p className="text-sm text-base-content/60">
                    {userStats ? formatBytes(userStats.storage_used) : '0 Bytes'} of {userStats ? formatBytes(userStats.storage_limit) : '0 Bytes'} used
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <progress 
                  className={`progress w-full ${getProgressColor(storagePercentage)}`} 
                  value={storagePercentage} 
                  max="100"
                ></progress>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/60">{storagePercentage}% used</span>
                  <span className={`font-medium ${storagePercentage >= 90 ? 'text-error' : storagePercentage >= 70 ? 'text-warning' : 'text-primary'}`}>
                    {100 - storagePercentage}% remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Document Count */}
            <div className="bg-base-100 border border-base-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-base-content">Documents</h3>
                  <p className="text-sm text-base-content/60">
                    {userStats?.document_count || 0} of {userStats?.document_limit || 0} documents
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <progress 
                  className={`progress w-full ${getProgressColor(documentsPercentage)}`} 
                  value={documentsPercentage} 
                  max="100"
                ></progress>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/60">{documentsPercentage}% used</span>
                  <span className={`font-medium ${documentsPercentage >= 90 ? 'text-error' : documentsPercentage >= 70 ? 'text-warning' : 'text-primary'}`}>
                    {(userStats?.document_limit || 0) - (userStats?.document_count || 0)} remaining
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Plan Features */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            <div className="bg-base-100 border border-base-300 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-accent/10 rounded-lg">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-base-content">Version History</p>
                  <p className="text-xs text-base-content/60">{userStats?.version_history_days || 0} days</p>
                </div>
              </div>
            </div>

            <div className="bg-base-100 border border-base-300 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-info/10 rounded-lg">
                  <svg className="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-base-content">Public Sharing</p>
                  <p className="text-xs text-base-content/60">
                    {userStats?.can_share_public ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-base-100 border border-base-300 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-warning/10 rounded-lg">
                  <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-base-content">Password Protection</p>
                  <p className="text-xs text-base-content/60">
                    {userStats?.can_password_protect ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Section */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-base-content mb-3">Upgrade Your Plan</h2>
            <p className="text-base-content/60 max-w-2xl mx-auto">
              Get more storage, documents, and premium features to supercharge your productivity
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="bg-base-100 border border-base-300 rounded-xl p-6 relative">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-base-content mb-2">Free</h3>
                <div className="text-3xl font-bold text-base-content">$0</div>
                <p className="text-sm text-base-content/60">forever</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>100 documents</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>20MB assets storage</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>10 versions per document</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Email support</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-base-content/60">
                  <svg className="w-4 h-4 text-base-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>No public sharing</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-base-content/60">
                  <svg className="w-4 h-4 text-base-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>No password protection</span>
                </li>
              </ul>
              
              <button className="btn btn-outline w-full" disabled>
                Current Plan
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-base-100 border border-primary rounded-xl p-6 relative">
              <div className="badge badge-primary absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-base-content mb-2">Pro</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <div className="text-3xl font-bold text-base-content">$1.99</div>
                  <div className="text-lg text-base-content/60">/mo</div>
                </div>
                <p className="text-sm text-base-content/60">$19.9 yearly</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>5,000 documents</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>1GB assets storage</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>100 versions per document</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority email support</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Public sharing links</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Password protection</span>
                </li>
              </ul>
              
              <button className="btn btn-primary w-full">
                Upgrade to Pro
              </button>
            </div>

            {/* Max Plan */}
            <div className="bg-base-100 border border-base-300 rounded-xl p-6 relative">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-base-content mb-2">Max</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <div className="text-3xl font-bold text-base-content">$3.99</div>
                  <div className="text-lg text-base-content/60">/mo</div>
                </div>
                <p className="text-sm text-base-content/60">$39.9 yearly</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Unlimited documents</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>10GB assets storage</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>100 versions per document</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority email support</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Public sharing links</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Password protection</span>
                </li>
              </ul>
              
              <button className="btn btn-outline w-full">
                Upgrade to Max
              </button>
            </div>
          </div>

          {/* FAQ or Additional Info */}
          <div className="text-center mt-8">
            <p className="text-sm text-base-content/60 mb-4">
              All plans include our core markdown editor, folder organization, and export features.
            </p>
            <p className="text-xs text-base-content/40">
              Plans can be changed or cancelled at any time. No hidden fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}