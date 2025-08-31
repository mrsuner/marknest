'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Document {
  id: number;
  title: string;
  content: string;
  updated_at: string;
  folder_name?: string;
  word_count: number;
}

const mockRecentDocuments: Document[] = [
  {
    id: 1,
    title: 'Project Proposal Draft',
    content: 'This is a comprehensive project proposal for the new markdown editor platform...',
    updated_at: '2025-08-31T10:30:00Z',
    folder_name: 'Work Projects',
    word_count: 1245,
  },
  {
    id: 2,
    title: 'Meeting Notes - Q4 Planning',
    content: 'Key discussion points from today\'s quarterly planning meeting...',
    updated_at: '2025-08-30T16:45:00Z',
    folder_name: 'Meeting Notes',
    word_count: 623,
  },
  {
    id: 3,
    title: 'Feature Specifications',
    content: 'Detailed specifications for the upcoming features including user authentication...',
    updated_at: '2025-08-30T14:20:00Z',
    word_count: 892,
  },
  {
    id: 4,
    title: 'User Guide Documentation',
    content: 'Complete user guide for the markdown editor with screenshots and examples...',
    updated_at: '2025-08-29T11:15:00Z',
    folder_name: 'Documentation',
    word_count: 2156,
  },
  {
    id: 5,
    title: 'API Design Document',
    content: 'REST API endpoints documentation with request/response examples...',
    updated_at: '2025-08-28T09:30:00Z',
    folder_name: 'Technical Docs',
    word_count: 1534,
  },
  {
    id: 6,
    title: 'Database Schema Design',
    content: 'Entity relationship diagrams and table structures for the application database...',
    updated_at: '2025-08-27T15:22:00Z',
    folder_name: 'Technical Docs',
    word_count: 967,
  },
  {
    id: 7,
    title: 'Marketing Campaign Brief',
    content: 'Campaign strategy and creative brief for Q1 2025 product launch...',
    updated_at: '2025-08-26T13:18:00Z',
    folder_name: 'Marketing',
    word_count: 1823,
  },
  {
    id: 8,
    title: 'Team Onboarding Guide',
    content: 'Step-by-step guide for new team members including tools and processes...',
    updated_at: '2025-08-25T09:45:00Z',
    folder_name: 'HR',
    word_count: 2341,
  },
  {
    id: 9,
    title: 'Security Audit Report',
    content: 'Comprehensive security assessment findings and recommendations...',
    updated_at: '2025-08-24T16:30:00Z',
    folder_name: 'Security',
    word_count: 3456,
  },
  {
    id: 10,
    title: 'User Research Findings',
    content: 'Analysis of user interviews and usability testing sessions...',
    updated_at: '2025-08-23T11:12:00Z',
    folder_name: 'Research',
    word_count: 2789,
  },
  {
    id: 11,
    title: 'Performance Optimization Plan',
    content: 'Strategies for improving application performance and scalability...',
    updated_at: '2025-08-22T14:55:00Z',
    folder_name: 'Technical Docs',
    word_count: 1876,
  },
  {
    id: 12,
    title: 'Content Style Guide',
    content: 'Brand voice, tone, and writing guidelines for all marketing materials...',
    updated_at: '2025-08-21T10:33:00Z',
    folder_name: 'Marketing',
    word_count: 1234,
  },
  {
    id: 13,
    title: 'Budget Allocation Q4',
    content: 'Detailed budget breakdown for Q4 expenses and resource allocation...',
    updated_at: '2025-08-20T12:40:00Z',
    folder_name: 'Finance',
    word_count: 892,
  },
  {
    id: 14,
    title: 'Client Requirements Document',
    content: 'Detailed requirements gathered from client stakeholders...',
    updated_at: '2025-08-19T08:15:00Z',
    folder_name: 'Projects',
    word_count: 2456,
  },
  {
    id: 15,
    title: 'Testing Strategy Document',
    content: 'Comprehensive testing approach including unit, integration, and e2e tests...',
    updated_at: '2025-08-18T17:22:00Z',
    folder_name: 'QA',
    word_count: 1654,
  },
];

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
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'words'>('updated');
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsPerPage, setDocumentsPerPage] = useState(9);

  const filteredDocuments = mockRecentDocuments
    .filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.folder_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'words':
          return b.word_count - a.word_count;
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  // Pagination calculations
  const totalDocuments = filteredDocuments.length;
  const totalPages = Math.ceil(totalDocuments / documentsPerPage);
  const startIndex = (currentPage - 1) * documentsPerPage;
  const endIndex = startIndex + documentsPerPage;
  const currentDocuments = filteredDocuments.slice(startIndex, endIndex);

  // Reset to first page when search or sort changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: 'updated' | 'title' | 'words') => {
    setSortBy(value);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Recent Documents</h1>
          <p className="text-base-content/60 mt-1">
            {totalDocuments > 0 ? (
              <>
                Showing {startIndex + 1}-{Math.min(endIndex, totalDocuments)} of {totalDocuments} documents
                {searchQuery && ` matching "${searchQuery}"`}
              </>
            ) : (
              `${mockRecentDocuments.length} total documents`
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
          onChange={(e) => handleSortChange(e.target.value as 'updated' | 'title' | 'words')}
          className="select select-bordered w-full sm:w-auto"
        >
          <option value="updated">Sort by Updated</option>
          <option value="title">Sort by Title</option>
          <option value="words">Sort by Word Count</option>
        </select>
      </div>

      {/* Documents Grid */}
      {currentDocuments.length === 0 ? (
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
          {currentDocuments.map((document) => (
            <Link
              key={document.id}
              href={`/documents/${document.id}/edit`}
              className="card bg-base-100 hover:bg-base-200 border border-base-300 hover:border-primary/20 transition-all duration-200 hover:shadow-lg"
            >
              <div className="card-body p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-base-content line-clamp-2 flex-1">
                    {document.title}
                  </h3>
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </div>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48 border border-base-300 z-10">
                      <li><a href="#edit">Edit</a></li>
                      <li><a href="#duplicate">Duplicate</a></li>
                      <li><a href="#share">Share</a></li>
                      <li><hr className="my-1" /></li>
                      <li><a href="#delete" className="text-error">Delete</a></li>
                    </ul>
                  </div>
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
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
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
              disabled={currentPage === 1}
              className="btn btn-sm btn-ghost disabled:opacity-50"
              aria-label="First page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-sm btn-ghost disabled:opacity-50"
              aria-label="Previous page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const distance = Math.abs(page - currentPage);
                  return distance === 0 || distance === 1 || page === 1 || page === totalPages;
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn btn-sm btn-ghost disabled:opacity-50"
              aria-label="Next page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
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