'use client';

import { useState } from 'react';
import { useGetTrashedQuery, useRestoreDocumentMutation, useForceDeleteDocumentMutation } from '@/lib/store/api/documentsApi';

interface TrashedDocument {
  id: string;
  title: string;
  slug: string;
  folder_id: string | null;
  folder_name?: string;
  folder_path?: string;
  word_count: number;
  character_count: number;
  size: number;
  version_number: number;
  is_favorite: boolean;
  is_archived: boolean;
  tags?: string[];
  status: string;
  deleted_at: string;
  days_until_permanent_deletion: number;
  created_at: string;
  updated_at: string;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInHours < 168) {
    return `${Math.floor(diffInHours / 24)}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function formatDaysRemaining(days: number) {
  if (days <= 0) {
    return 'Will be deleted soon';
  } else if (days === 1) {
    return '1 day remaining';
  } else {
    return `${days} days remaining`;
  }
}

export default function TrashedDocumentsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsPerPage, setDocumentsPerPage] = useState(10);
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null);
  const [restoreConfirmName, setRestoreConfirmName] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>('');

  const {
    data: response,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetTrashedQuery({
    page: currentPage,
    per_page: documentsPerPage,
  });

  const [restoreDocument, { isLoading: isRestoring }] = useRestoreDocumentMutation();
  const [forceDeleteDocument, { isLoading: isDeleting }] = useForceDeleteDocumentMutation();

  const documents = response?.data || [];
  const meta = response?.meta;

  // Handle restore action
  const handleRestore = (document: TrashedDocument) => {
    setRestoreConfirmId(document.id);
    setRestoreConfirmName(document.title);
  };

  // Handle restore confirmation
  const handleRestoreConfirm = async () => {
    if (!restoreConfirmId) return;
    
    try {
      await restoreDocument(restoreConfirmId).unwrap();
      setRestoreConfirmId(null);
      setRestoreConfirmName('');
      refetch();
    } catch (error) {
      console.error('Failed to restore document:', error);
    }
  };

  // Handle permanent delete action
  const handlePermanentDelete = (document: TrashedDocument) => {
    setDeleteConfirmId(document.id);
    setDeleteConfirmName(document.title);
  };

  // Handle permanent delete confirmation
  const handlePermanentDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    
    try {
      await forceDeleteDocument(deleteConfirmId).unwrap();
      setDeleteConfirmId(null);
      setDeleteConfirmName('');
      refetch();
    } catch (error) {
      console.error('Failed to permanently delete document:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Trashed Documents</h1>
            <p className="text-base-content/60 mt-1">Loading...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card bg-base-100 border border-base-300 animate-pulse">
              <div className="card-body p-4">
                <div className="h-4 bg-base-300 rounded mb-2"></div>
                <div className="h-3 bg-base-300 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-base-300 rounded w-20"></div>
                  <div className="h-3 bg-base-300 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-error/10 rounded-full mb-4">
            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-base-content mb-2">Failed to load trashed documents</h3>
          <p className="text-base-content/60">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Trashed Documents</h1>
          <p className="text-base-content/60 mt-1">
            {meta && meta.total > 0 ? (
              <>
                Showing {meta.from || 1}-{meta.to || 0} of {meta.total} trashed documents
                {isFetching && <span className="loading loading-spinner loading-xs ml-2"></span>}
              </>
            ) : (
              <>
                No documents in trash
                {isFetching && <span className="loading loading-spinner loading-xs ml-2"></span>}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <div className="alert alert-info">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Documents in trash will be permanently deleted after 30 days.</span>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-base-200 rounded-full mb-4">
            <svg className="w-8 h-8 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-base-content mb-2">Trash is empty</h3>
          <p className="text-base-content/60">
            Deleted documents will appear here and can be restored within 30 days.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="card bg-base-100 border border-base-300 hover:border-warning/30 transition-all duration-200"
            >
              <div className="card-body p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-base-content line-clamp-2 flex-1">
                    {document.title}
                  </h3>
                  <div className={`badge badge-sm ${
                    document.days_until_permanent_deletion <= 7 
                      ? 'badge-error' 
                      : document.days_until_permanent_deletion <= 14 
                      ? 'badge-warning' 
                      : 'badge-info'
                  }`}>
                    {formatDaysRemaining(document.days_until_permanent_deletion)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-base-content/50 mb-4">
                  <div className="flex items-center gap-4">
                    {document.folder_name && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        {document.folder_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {document.word_count} words
                    </span>
                  </div>
                  <span>Deleted {formatDate(document.deleted_at)}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(document)}
                    className="btn btn-sm btn-primary flex-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Restore
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(document)}
                    className="btn btn-sm btn-error btn-outline flex-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Forever
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-base-300">
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content/60">Items per page:</span>
            <select
              value={documentsPerPage}
              onChange={(e) => {
                setDocumentsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="select select-bordered select-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="btn btn-sm btn-ghost disabled:opacity-50"
            >
              First
            </button>
            
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-sm btn-ghost disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm px-3">
              Page {currentPage} of {meta.last_page}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, meta?.last_page || 1))}
              disabled={currentPage === meta.last_page}
              className="btn btn-sm btn-ghost disabled:opacity-50"
            >
              Next
            </button>
            
            <button
              onClick={() => setCurrentPage(meta?.last_page || 1)}
              disabled={currentPage === meta.last_page}
              className="btn btn-sm btn-ghost disabled:opacity-50"
            >
              Last
            </button>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {restoreConfirmId && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Restore Document</h3>
            <p className="mb-4">
              Are you sure you want to restore &ldquo;{restoreConfirmName}&rdquo;?
            </p>
            <p className="text-sm text-base-content/60 mb-4">
              The document will be moved back to your documents and be accessible again.
            </p>
            <div className="modal-action">
              <button 
                onClick={() => {
                  setRestoreConfirmId(null);
                  setRestoreConfirmName('');
                }} 
                className="btn"
                disabled={isRestoring}
              >
                Cancel
              </button>
              <button 
                onClick={handleRestoreConfirm} 
                className="btn btn-primary"
                disabled={isRestoring}
              >
                {isRestoring ? 'Restoring...' : 'Restore'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Permanently Delete Document</h3>
            <div className="alert alert-warning mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>This action cannot be undone!</span>
            </div>
            <p className="mb-4">
              Are you sure you want to permanently delete &ldquo;{deleteConfirmName}&rdquo;? This will remove the document and all its versions forever.
            </p>
            <div className="modal-action">
              <button 
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteConfirmName('');
                }} 
                className="btn"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handlePermanentDeleteConfirm} 
                className="btn btn-error"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}