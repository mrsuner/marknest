"use client";

import { useShareUtils, useToggleDocumentShareMutation } from '../domain';
import type { DocumentShare } from '../domain';

interface SharesCardsMobileProps {
  shares: DocumentShare[];
  selectedShares: Set<string>;
  onToggleSelection: (shareId: string) => void;
  onEditShare: (share: DocumentShare) => void;
  onDeleteShare: (shareId: string) => void;
}

export function SharesCardsMobile({
  shares,
  selectedShares,
  onToggleSelection,
  onEditShare,
  onDeleteShare,
}: SharesCardsMobileProps) {
  const { copyToClipboard, getExpiryStatus, getShareUrl } = useShareUtils();
  const [toggleShareStatus] = useToggleDocumentShareMutation();

  const handleToggleStatus = async (shareId: string) => {
    try {
      await toggleShareStatus(shareId).unwrap();
    } catch (error) {
      console.error('Failed to toggle share status:', error);
    }
  };

  return (
    <div className="lg:hidden space-y-4">
      {shares.map((share) => {
        const expiryStatus = getExpiryStatus(share.expires_at);
        
        return (
          <div key={share.id} className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={selectedShares.has(share.id)}
                    onChange={() => onToggleSelection(share.id)}
                  />
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{share.document?.title}</h3>
                    <p className="text-sm text-base-content/60">{share.view_count} views</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-success toggle-sm"
                  checked={share.is_active}
                  onChange={() => handleToggleStatus(share.id)}
                />
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-mono text-sm bg-base-200 px-2 py-1 rounded truncate">
                    {share.short_url || `...${share.share_token.slice(-6)}`}
                  </span>
                  <button
                    onClick={() => copyToClipboard(getShareUrl(share))}
                    className="btn btn-ghost btn-xs"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 text-sm">
                <span className={`badge badge-sm ${expiryStatus.className}`}>
                  {expiryStatus.text}
                </span>
                <div className="flex gap-2">
                  <button 
                    className="btn btn-ghost btn-xs"
                    onClick={() => window.open(`/documents/${share.document_id}`, '_blank')}
                  >
                    View
                  </button>
                  <button 
                    className="btn btn-ghost btn-xs"
                    onClick={() => onEditShare(share)}
                  >
                    Edit
                  </button>
                  <button className="btn btn-ghost btn-xs">Stats</button>
                  <button 
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => onDeleteShare(share.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}