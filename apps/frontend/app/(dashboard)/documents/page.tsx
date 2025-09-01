'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useGetRecentQuery } from '@/lib/store/api/documentsApi';
import { Document } from '@/lib/store/api/api';



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

function truncateContent(content: string, maxLength: number = 150) {
  return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
}

export default function RecentDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated_at' | 'title' | 'word_count' | 'created_at'>('updated_at');
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsPerPage, setDocumentsPerPage] = useState(9);

  // API query parameters
  const queryParams = useMemo(() => ({
    page: currentPage,
    per_page: documentsPerPage,
    search: searchQuery || undefined,
    sort_by: sortBy,
    sort_direction: 'desc' as const,
  }), [currentPage, documentsPerPage, searchQuery, sortBy]);

  const {
    data: response,
    error,
    isLoading,
    isFetching,
  } = useGetRecentQuery(queryParams);

  const documents = response?.data || [];
  const meta = response?.meta;

  // Reset to first page when search or sort changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: 'updated_at' | 'title' | 'word_count' | 'created_at') => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Recent Documents</h1>
            <p className="text-base-content/60 mt-1">Loading...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card bg-base-100 border border-base-300 animate-pulse">
              <div className="card-body p-4">
                <div className="h-4 bg-base-300 rounded mb-2"></div>
                <div className="h-3 bg-base-300 rounded mb-4"></div>
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

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-error/10 rounded-full mb-4">
            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-base-content mb-2">Failed to load documents</h3>
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
          <h1 className="text-3xl font-bold text-base-content">Recent Documents</h1>
          <p className="text-base-content/60 mt-1">
            {meta && meta.total > 0 ? (
              <>
                Showing {meta.from || 1}-{meta.to || 0} of {meta.total} documents
                {searchQuery && ` matching "${searchQuery}"`}
                {isFetching && <span className="loading loading-spinner loading-xs ml-2"></span>}
              </>
            ) : (
              <>
                {meta?.total === 0 && searchQuery ? 'No documents found' : 'No documents yet'}
                {isFetching && <span className="loading loading-spinner loading-xs ml-2"></span>}
              </>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href="/documents/new"
            className="btn btn-primary btn-sm sm:btn-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            New Document
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
          <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <select 
          value={sortBy} 
          onChange={(e) => handleSortChange(e.target.value as 'updated_at' | 'title' | 'word_count' | 'created_at')}
          className="select select-bordered w-full sm:w-auto"
        >
          <option value="updated_at">Sort by Updated</option>
          <option value="title">Sort by Title</option>
          <option value="word_count">Sort by Word Count</option>
          <option value="created_at">Sort by Created</option>
        </select>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-base-200 rounded-full mb-4">
            <svg className="w-8 h-8 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-base-content mb-2">No documents found</h3>
          <p className="text-base-content/60">
            {searchQuery ? 'Try adjusting your search terms.' : 'Create your first document to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="card bg-base-100 hover:bg-base-200 border border-base-300 hover:border-primary/20 transition-all duration-200 hover:shadow-lg relative"
            >
              <Link
                href={`/documents/${document.id}/edit`}
                className="card-body p-4 block"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-base-content line-clamp-2 flex-1">
                    {document.title}
                  </h3>
                </div>
                
                <p className="text-sm text-base-content/70 mb-4 line-clamp-3">
                  {truncateContent(document.content)}
                </p>
                
                <div className="flex items-center justify-between text-xs text-base-content/50">
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
                  <span>{formatDate(document.updated_at)}</span>
                </div>
              </Link>
              
              <div className="dropdown dropdown-end absolute top-4 right-4">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </div>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48 border border-base-300 z-10">
                  <li><button onClick={() => window.location.href = `/documents/${document.id}/edit`}>Edit</button></li>
                  <li><button>Duplicate</button></li>
                  <li><button>Share</button></li>
                  <li><hr className="my-1" /></li>
                  <li><button className="text-error">Delete</button></li>
                </ul>
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
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={!meta || currentPage === 1}
              className="btn btn-sm btn-ghost disabled:opacity-50"
              aria-label="First page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={!meta || currentPage === 1}
              className="btn btn-sm btn-ghost disabled:opacity-50"
              aria-label="Previous page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-1">
              {meta && Array.from({ length: meta.last_page }, (_, i) => i + 1)
                .filter(page => {
                  const distance = Math.abs(page - currentPage);
                  return distance === 0 || distance === 1 || page === 1 || page === meta.last_page;
                })
                .map((page, index, filteredPages) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && filteredPages[index - 1] !== page - 1 && (
                      <span className="px-2 text-base-content/40">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`btn btn-sm ${
                        currentPage === page
                          ? 'btn-primary'
                          : 'btn-ghost hover:bg-base-200'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))
              }
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, meta?.last_page || 1))}
              disabled={!meta || currentPage === meta.last_page}
              className="btn btn-sm btn-ghost disabled:opacity-50"
              aria-label="Next page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button
              onClick={() => setCurrentPage(meta?.last_page || 1)}
              disabled={!meta || currentPage === meta.last_page}
              className="btn btn-sm btn-ghost disabled:opacity-50"
              aria-label="Last page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}