"use client";

import { useShareUtils, useToggleDocumentShareMutation } from '../domain';
import type { DocumentShare } from '../domain';

interface SharesTableDesktopProps {
  shares: DocumentShare[];
  selectedShares: Set<string>;
  onToggleSelection: (shareId: string) => void;
  onToggleAll: (checked: boolean) => void;
  onEditShare: (share: DocumentShare) => void;
  onDeleteShare: (shareId: string) => void;
}

export function SharesTableDesktop({
  shares,
  selectedShares,
  onToggleSelection,
  onToggleAll,
  onEditShare,
  onDeleteShare,
}: SharesTableDesktopProps) {
  const { copyToClipboard, getExpiryStatus, getViewsProgress, getShareUrl } = useShareUtils();
  const [toggleShareStatus] = useToggleDocumentShareMutation();

  const handleToggleStatus = async (shareId: string) => {
    try {
      await toggleShareStatus(shareId).unwrap();
    } catch (error) {
      console.error('Failed to toggle share status:', error);
    }
  };

  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                onChange={(e) => onToggleAll(e.target.checked)}
              />
            </th>
            <th>Document</th>
            <th>Link</th>
            <th>Views</th>
            <th>Expires</th>
            <th>Permissions</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shares.map((share) => {
            const expiryStatus = getExpiryStatus(share.expires_at);
            const viewsProgress = getViewsProgress(share.view_count, share.max_views);
            
            return (
              <tr key={share.id}>
                <td>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={selectedShares.has(share.id)}
                    onChange={() => onToggleSelection(share.id)}
                  />
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">{share.document?.title}</div>
                      <div className="text-sm text-base-content/60">Created {new Date(share.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm bg-base-200 px-2 py-1 rounded">
                      {share.short_url || `...${share.share_token.slice(-6)}`}
                    </span>
                    <button
                      onClick={() => copyToClipboard(getShareUrl(share))}
                      className="btn btn-ghost btn-xs"
                      title="Copy link"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </td>
                <td>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{share.view_count}</span>
                      {share.max_views && <span className="text-xs text-base-content/60">/ {share.max_views}</span>}
                    </div>
                    {share.max_views && (
                      <div className="w-20">
                        <div className={`progress progress-xs ${viewsProgress.isNearLimit ? 'progress-warning' : 'progress-primary'}`} value={viewsProgress.percentage} max="100"></div>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`badge badge-sm ${expiryStatus.className}`}>
                    {expiryStatus.text}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1">
                    {share.allow_download && (
                      <div className="tooltip" data-tip="Download allowed">
                        <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                    {share.allow_copy && (
                      <div className="tooltip" data-tip="Copy allowed">
                        <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {share.show_watermark && (
                      <div className="tooltip" data-tip="Watermark enabled">
                        <svg className="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="toggle toggle-success toggle-sm"
                    checked={share.is_active}
                    onChange={() => handleToggleStatus(share.id)}
                  />
                </td>
                <td>
                  <div className="flex gap-1">
                    <button 
                      className="btn btn-ghost btn-xs" 
                      title="View"
                      onClick={() => window.open(`/documents/${share.document_id}`, '_blank')}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button 
                      className="btn btn-ghost btn-xs" 
                      title="Edit"
                      onClick={() => onEditShare(share)}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="btn btn-ghost btn-xs" title="Analytics">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                    <button 
                      className="btn btn-ghost btn-xs text-error" 
                      title="Delete"
                      onClick={() => onDeleteShare(share.id)}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}