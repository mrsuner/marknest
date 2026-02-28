'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { env } from '@/lib/config/env';
import StatsCard from '@/components/ui/StatsCard';

interface User {
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
  has_password: boolean;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
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
          setUser(data);
          setProfileForm({
            name: data.name,
            email: data.email
          });
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await fetch(`${env.API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setPasswordError('');
    setPasswordSuccess('');
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }

    setIsUpdating(true);
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const requestBody: any = {
        new_password: passwordForm.newPassword,
      };

      // Only include current_password if user has an existing password
      if (user?.has_password && passwordForm.currentPassword) {
        requestBody.current_password = passwordForm.currentPassword;
      }

      const response = await fetch(`${env.API_BASE_URL}/api/me/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
        setPasswordSuccess(result.message || 'Password updated successfully.');
        
        // Refresh user data to update has_password field
        const userResponse = await fetch(`${env.API_BASE_URL}/api/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }
      } else {
        const errorData = await response.json();
        if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0] as string[];
          setPasswordError(firstError[0] || 'Password change failed.');
        } else {
          setPasswordError(errorData.message || 'Password change failed.');
        }
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      setPasswordError('An error occurred while changing the password.');
    } finally {
      setIsUpdating(false);
    }
  };

  const storagePercentage = user ? Math.round((user.storage_used / user.storage_limit) * 100) : 0;
  const documentsPercentage = user ? Math.round((user.document_count / user.document_limit) * 100) : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-base-300 rounded w-48"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-base-300 rounded-xl"></div>
            <div className="h-96 bg-base-300 rounded-xl"></div>
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
          <h1 className="text-3xl font-bold text-base-content mb-2">Profile Settings</h1>
          <p className="text-base-content/60">Manage your personal information and account preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Avatar and Basic Info */}
            <div className="bg-base-100 border border-base-300 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-base-content mb-6">Profile Information</h2>
              
              {/* Avatar Section */}
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-base-content mb-1">{user?.name}</h3>
                  <p className="text-sm text-base-content/60 mb-3">{user?.email}</p>
                  <div className="flex gap-3">
                    <button className="btn btn-outline btn-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Change Avatar
                    </button>
                    <button className="btn btn-ghost btn-sm text-error">
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Email Address</span>
                    </label>
                    <input
                      type="email"
                      className="input input-bordered w-full"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Section */}
            <div className="bg-base-100 border border-base-300 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-base-content">Password & Security</h2>
                  <p className="text-sm text-base-content/60 mt-1">
                    {user?.has_password 
                      ? "Keep your account secure" 
                      : "Set up a password for additional security"}
                  </p>
                </div>
                {!showPasswordForm && (
                  <button 
                    onClick={() => {
                      setShowPasswordForm(true);
                      setPasswordError('');
                      setPasswordSuccess('');
                    }}
                    className="btn btn-outline"
                  >
                    {user?.has_password ? 'Change Password' : 'Set Password'}
                  </button>
                )}
              </div>

              {passwordSuccess && (
                <div className="alert alert-success mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {passwordSuccess}
                </div>
              )}

              {passwordError && (
                <div className="alert alert-error mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {passwordError}
                </div>
              )}

              {showPasswordForm && (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {user?.has_password && (
                    <div>
                      <label className="label">
                        <span className="label-text">Current Password</span>
                      </label>
                      <input
                        type="password"
                        className="input input-bordered w-full"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">New Password</span>
                      </label>
                      <input
                        type="password"
                        className="input input-bordered w-full"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Confirm New Password</span>
                      </label>
                      <input
                        type="password"
                        className="input input-bordered w-full"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setPasswordError('');
                        setPasswordSuccess('');
                      }}
                      className="btn btn-ghost"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={
                        isUpdating || 
                        passwordForm.newPassword !== passwordForm.confirmPassword ||
                        passwordForm.newPassword.length < 8 ||
                        (user?.has_password && !passwordForm.currentPassword)
                      }
                    >
                      {isUpdating 
                        ? (user?.has_password ? 'Changing...' : 'Setting...') 
                        : (user?.has_password ? 'Change Password' : 'Set Password')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar with Stats and Subscription */}
          <div className="space-y-6">
            {/* Current Subscription */}
            <div className="bg-base-100 border border-base-300 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-base-content">Current Plan</h3>
                <div className="badge badge-primary font-medium">
                  {user?.plan?.toUpperCase() || 'FREE'}
                </div>
              </div>
              <p className="text-sm text-base-content/60 mb-4">
                You're currently on the {user?.plan || 'Free'} plan.
              </p>
              <Link href="/settings" className="btn btn-outline btn-sm w-full">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Upgrade Plan
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base-content">Usage Overview</h3>
              
              <StatsCard
                title="Storage"
                subtitle={`${user ? formatBytes(user.storage_used) : '0 Bytes'} used`}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                  </svg>
                }
                percentage={storagePercentage}
                remaining={`${100 - storagePercentage}% remaining`}
                showProgress={true}
                iconBgColor="bg-primary/10"
                iconTextColor="text-primary"
              />

              <StatsCard
                title="Documents"
                subtitle={`${user?.document_count || 0} created`}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                percentage={documentsPercentage}
                remaining={`${(user?.document_limit || 0) - (user?.document_count || 0)} remaining`}
                showProgress={true}
                iconBgColor="bg-secondary/10"
                iconTextColor="text-secondary"
              />
            </div>

            {/* Account Actions */}
            <div className="bg-base-100 border border-base-300 rounded-xl p-6">
              <h3 className="font-semibold text-base-content mb-4">Account Actions</h3>
              <div className="space-y-3">
                <button className="btn btn-ghost btn-sm w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Data
                </button>
                <button className="btn btn-ghost btn-sm w-full justify-start text-error">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}