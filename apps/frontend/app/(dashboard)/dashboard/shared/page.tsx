'use client';

import { useState, useEffect } from 'react';
import { env } from '@/lib/config/env';

interface DocumentShare {
  id: string;
  document: {
    id: string;
    title: string;
    type?: string;
  };
  share_token: string;
  short_url?: string;
  expires_at?: string;
  max_views?: number;
  view_count: number;
  allow_download: boolean;
  allow_copy: boolean;
  show_watermark: boolean;
  access_level: string;
  is_active: boolean;
  created_at: string;
}

interface ApiResponse {
  data: DocumentShare[];
  current_page: number;
  last_page: number;
  total: number;
}

export default function SharedLinksPage() {
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShares, setSelectedShares] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [accessFilter, setAccessFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchShares = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '15',
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter }),
        ...(accessFilter && { access_level: accessFilter }),
      });

      const response = await fetch(`${env.API_BASE_URL}/api/document-shares?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shares');
      }

      const data: ApiResponse = await response.json();
      setShares(data.data);
      setCurrentPage(data.current_page);
      setTotalPages(data.last_page);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchShares(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, statusFilter, accessFilter]);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // TODO: Add toast notification
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleShareStatus = async (shareId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${env.API_BASE_URL}/api/document-shares/${shareId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle share status');
      }

      const updatedShare = await response.json();
      setShares(shares.map(share => 
        share.id === shareId ? updatedShare : share
      ));
    } catch (err) {
      console.error('Failed to toggle share status:', err);
    }
  };

  const deleteShare = async (shareId: string) => {
    if (!confirm('Are you sure you want to delete this share?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${env.API_BASE_URL}/api/document-shares/${shareId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete share');
      }

      setShares(shares.filter(share => share.id !== shareId));
      setSelectedShares(prev => {
        const newSet = new Set(prev);
        newSet.delete(shareId);
        return newSet;
      });
    } catch (err) {
      console.error('Failed to delete share:', err);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    const shareIds = Array.from(selectedShares);
    if (shareIds.length === 0) return;

    if (action === 'delete' && !confirm(`Are you sure you want to delete ${shareIds.length} share(s)?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${env.API_BASE_URL}/api/document-shares/bulk-update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          share_ids: shareIds,
          action: action,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to perform bulk action');
      }

      // Refresh the data
      await fetchShares(currentPage);
      setSelectedShares(new Set());
    } catch (err) {
      console.error('Failed to perform bulk action:', err);
    }
  };

  const getExpiryStatus = (expiresAt: string | null) => {
    if (!expiresAt) return { text: 'Never', className: 'badge-ghost' };
    
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Expired', className: 'badge-error' };
    if (diffDays <= 7) return { text: `${diffDays}d left`, className: 'badge-warning' };
    return { text: expiry.toLocaleDateString(), className: 'badge-ghost' };
  };

  const getViewsProgress = (current: number, max: number | null) => {
    if (!max) return { percentage: 0, isNearLimit: false };
    const percentage = (current / max) * 100;
    return { percentage, isNearLimit: percentage > 80 };
  };

  const toggleShareSelection = (shareId: string) => {
    const newSelection = new Set(selectedShares);
    if (newSelection.has(shareId)) {
      newSelection.delete(shareId);
    } else {
      newSelection.add(shareId);
    }
    setSelectedShares(newSelection);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Shared Links</h1>
          <p className="text-base-content/60 mt-1">Manage your document sharing links</p>
        </div>
        
        <div className="flex gap-2">
          {selectedShares.size > 0 && (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-outline btn-sm">
                Bulk Actions ({selectedShares.size})
              </div>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40">
                <li><button onClick={() => handleBulkAction('activate')}>Enable Selected</button></li>
                <li><button onClick={() => handleBulkAction('deactivate')}>Disable Selected</button></li>
                <li><button onClick={() => handleBulkAction('delete')} className="text-error">Delete Selected</button></li>
              </ul>
            </div>
          )}
          <button className="btn btn-primary btn-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            New Share
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search documents..."
            className="input input-bordered w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select 
          className="select select-bordered w-full sm:w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
        <select 
          className="select select-bordered w-full sm:w-auto"
          value={accessFilter}
          onChange={(e) => setAccessFilter(e.target.value)}
        >
          <option value="">All Access</option>
          <option value="public">Public</option>
          <option value="password">Password Protected</option>
          <option value="email_list">Email List</option>
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="alert alert-error mb-6">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => fetchShares()}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      )}

      {/* Desktop Table */}
      {!loading && !error && (
        <div className="hidden lg:block overflow-x-auto">
          <table className="table table-zebra">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedShares(new Set(shares.map(s => s.id)));
                    } else {
                      setSelectedShares(new Set());
                    }
                  }}
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
                      onChange={() => toggleShareSelection(share.id)}
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
                        <div className="font-medium">{share.document.title}</div>
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
                        onClick={() => copyToClipboard(share.short_url || `${window.location.origin}/share/${share.share_token}`)}
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
                      onChange={() => toggleShareStatus(share.id)}
                    />
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-xs" title="Edit">
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
                        onClick={() => deleteShare(share.id)}
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
      )}

      {/* Mobile Cards */}
      {!loading && !error && (
        <div className="lg:hidden space-y-4">
        {shares.map((share) => {
          const expiryStatus = getExpiryStatus(share.expires_at);
          const viewsProgress = getViewsProgress(share.view_count, share.max_views);
          
          return (
            <div key={share.id} className="card bg-base-100 shadow">
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedShares.has(share.id)}
                      onChange={() => toggleShareSelection(share.id)}
                    />
                    <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{share.document.title}</h3>
                      <p className="text-sm text-base-content/60">{share.view_count} views</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-success toggle-sm"
                    checked={share.is_active}
                    onChange={() => toggleShareStatus(share.id)}
                  />
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-mono text-sm bg-base-200 px-2 py-1 rounded truncate">
                      {share.short_url || `...${share.share_token.slice(-6)}`}
                    </span>
                    <button
                      onClick={() => copyToClipboard(share.short_url || `${window.location.origin}/share/${share.share_token}`)}
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
                    <button className="btn btn-ghost btn-xs">Edit</button>
                    <button className="btn btn-ghost btn-xs">Stats</button>
                    <button 
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => deleteShare(share.id)}
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
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="join">
            <button 
              className="join-item btn btn-sm"
              disabled={currentPage === 1}
              onClick={() => fetchShares(currentPage - 1)}
            >
              «
            </button>
            <button className="join-item btn btn-sm">
              Page {currentPage} of {totalPages}
            </button>
            <button 
              className="join-item btn btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => fetchShares(currentPage + 1)}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && shares.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-base-content/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
          </svg>
          <h3 className="text-lg font-medium text-base-content mb-2">No shared links yet</h3>
          <p className="text-base-content/60 mb-4">Share your documents to make them publicly accessible.</p>
          <button className="btn btn-primary">Create First Share</button>
        </div>
      )}
    </div>
  );
}