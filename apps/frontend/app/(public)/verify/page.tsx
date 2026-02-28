'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { env } from '@/lib/config/env';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);

  useEffect(() => {
    // Get OTP from URL if present (magic link)
    const otpFromUrl = searchParams.get('otp');
    if (otpFromUrl) {
      setOtp(otpFromUrl);
      setIsAutoVerifying(true);
    }
  }, [searchParams]);

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!email && !isAutoVerifying) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // For auto-verification from magic link, send without email
      const body = isAutoVerifying && !email 
        ? { otp, magic_link: true }
        : { email: email || localStorage.getItem('pending_email') || '', otp };
      
      const response = await fetch(`${env.API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid verification code');
      }

      // Store the token
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.removeItem('pending_email');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setIsAutoVerifying(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-verify if we have OTP from URL
  useEffect(() => {
    if (isAutoVerifying && otp) {
      handleVerify();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoVerifying, otp]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-base-100 via-base-200 to-base-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl lg:text-4xl font-light text-base-content mb-2 tracking-tight">
            {isAutoVerifying ? 'Verifying...' : 'Verify Your Account'}
          </h1>
          <p className="text-base-content/60 text-lg font-light">
            {isAutoVerifying ? 'Please wait while we verify your code' : 'Enter your verification details'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl shadow-lg border border-base-300/50 backdrop-blur-sm">
          <div className="p-8 lg:p-10">

            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error">
                {error}
              </div>
            )}

            {isAutoVerifying ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-base-content/60">Verifying your magic link...</p>
              </div>
            ) : (
              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label className="block text-base-content font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-4 bg-base-100 border border-base-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-base placeholder:text-base-content/40"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-base-content font-medium mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-4 bg-base-100 border border-base-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-base placeholder:text-base-content/40 text-center text-2xl font-mono tracking-widest"
                    required
                    disabled={isLoading}
                    maxLength={6}
                    pattern="[0-9]{6}"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-content px-6 py-4 rounded-2xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>
              </form>
            )}

            <div className="text-center mt-8">
              <p className="text-base-content/60 font-light">
                Need a new code?{' '}
                <Link 
                  href="/login" 
                  className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                >
                  Back to login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}