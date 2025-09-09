"use client";

interface SharesEmptyStateProps {
  onCreateShare: () => void;
}

export function SharesEmptyState({ onCreateShare }: SharesEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <svg className="w-16 h-16 mx-auto text-base-content/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
      </svg>
      <h3 className="text-lg font-medium text-base-content mb-2">No shared links yet</h3>
      <p className="text-base-content/60 mb-4">Share your documents to make them publicly accessible.</p>
      <button className="btn btn-primary" onClick={onCreateShare}>
        Create First Share
      </button>
    </div>
  );
}