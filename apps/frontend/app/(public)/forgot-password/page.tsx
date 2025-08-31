'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsLoading(true);
    
    // TODO: Implement actual forgot password logic here
    console.log('Forgot password request for:', email);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-base-100 via-base-200 to-base-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Success Card */}
          <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl shadow-lg border border-base-300/50 backdrop-blur-sm">
            <div className="p-8 lg:p-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-8">
                <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-light text-base-content mb-4 tracking-tight">Check Your Email</h1>
              
              <p className="text-base-content/70 mb-8 leading-relaxed text-lg">
                We&apos;ve sent a password reset link to{' '}
                <span className="font-medium text-base-content">{email}</span>.{' '}
                Please check your inbox and follow the instructions.
              </p>

              <div className="bg-info/5 border border-info/10 rounded-2xl p-4 mb-8">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-info mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="text-info/80 text-sm font-medium">Don&apos;t see the email? Check your spam folder or promotions tab.</span>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full bg-base-100 hover:bg-base-300/30 border border-base-300 px-6 py-4 rounded-2xl font-medium transition-all duration-300 hover:shadow-lg"
                >
                  Send Another Email
                </button>
                
                <Link 
                  href="/login" 
                  className="block w-full bg-primary hover:bg-primary/90 text-primary-content px-6 py-4 rounded-2xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-base-100 via-base-200 to-base-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl lg:text-4xl font-light text-base-content mb-2 tracking-tight">Reset Password</h1>
          <p className="text-base-content/60 text-lg font-light leading-relaxed max-w-sm mx-auto">
            Enter your email and we&apos;ll send you a secure link to create a new password.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl shadow-lg border border-base-300/50 backdrop-blur-sm">
          <div className="p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-base-content font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className={`w-full px-4 py-4 bg-base-100 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-base placeholder:text-base-content/40 ${
                    error ? 'border-error focus:ring-error/20 focus:border-error' : 'border-base-300'
                  }`}
                  required
                />
                {error && (
                  <p className="mt-2 text-sm text-error font-medium">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-content px-6 py-4 rounded-2xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    Sending Reset Link...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Send Reset Link
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                )}
              </button>
            </form>

            <div className="text-center mt-8 space-y-4">
              <p className="text-base-content/60 font-light">
                Remember your password?{' '}
                <Link 
                  href="/login" 
                  className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
              
              <p className="text-base-content/60 font-light">
                Don&apos;t have an account?{' '}
                <Link 
                  href="/signup" 
                  className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}