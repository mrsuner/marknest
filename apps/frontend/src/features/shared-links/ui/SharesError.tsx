"use client";

interface SharesErrorProps {
  error: string;
  onRetry: () => void;
}

export function SharesError({ error, onRetry }: SharesErrorProps) {
  return (
    <div className="alert alert-error mb-6">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{error}</span>
      <button 
        className="btn btn-sm btn-outline"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  );
}