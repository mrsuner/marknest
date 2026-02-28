'use client';

import { useState, useEffect } from 'react';
import { useGetFilesQuery } from '@/src/features/files/domain/files.api';
import { MediaFile, FileFilters, ViewMode } from '@/src/features/files/domain/files.types';
import Image from 'next/image';

interface FilesBrowseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: MediaFile) => void;
}

export default function FilesBrowseModal({ 
  isOpen, 
  onClose, 
  onFileSelect
}: FilesBrowseModalProps) {
  const [filters, setFilters] = useState<FileFilters>({
    sort_by: 'created_at',
    sort_order: 'desc',
    per_page: 20,
    page: 1
  });
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: filesResponse, isLoading, refetch } = useGetFilesQuery(filters);
  const files = filesResponse?.data || [];

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setSearchTerm('');
      refetch();
    }
  }, [isOpen, refetch]);

  // Handle search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchTerm || undefined,
        page: 1
      }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleFileTypeChange = (type: 'all' | 'images' | 'documents') => {
    setFilters(prev => ({
      ...prev,
      type: type === 'all' ? undefined : type,
      page: 1
    }));
  };

  const handleInsertFile = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
      onClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (mimeType: string): React.JSX.Element => {
    if (mimeType.startsWith('image/')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Browse Files</h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          {/* Search */}
          <div className="form-control flex-1">
            <input
              type="text"
              placeholder="Search files..."
              className="input input-bordered input-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter buttons */}
          <div className="btn-group">
            <button
              className={`btn btn-sm ${!filters.type ? 'btn-active' : ''}`}
              onClick={() => handleFileTypeChange('all')}
            >
              All
            </button>
            <button
              className={`btn btn-sm ${filters.type === 'images' ? 'btn-active' : ''}`}
              onClick={() => handleFileTypeChange('images')}
            >
              Images
            </button>
            <button
              className={`btn btn-sm ${filters.type === 'documents' ? 'btn-active' : ''}`}
              onClick={() => handleFileTypeChange('documents')}
            >
              Documents
            </button>
          </div>

          {/* View mode toggle */}
          <div className="btn-group">
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Files list/grid */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              No files found
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`card bg-base-200 cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedFile?.id === file.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedFile(file)}
                >
                  <figure className="px-4 pt-4">
                    {file.mime_type.startsWith('image/') ? (
                      <div className="relative w-full h-24">
                        <Image
                          src={file.url}
                          alt={file.alt_text || file.original_name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center bg-base-300 rounded">
                        {getFileIcon(file.mime_type)}
                      </div>
                    )}
                  </figure>
                  <div className="card-body p-4">
                    <p className="text-xs font-medium truncate" title={file.original_name}>
                      {file.original_name}
                    </p>
                    <p className="text-xs text-base-content/60">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-3 p-3 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 ${
                    selectedFile?.id === file.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedFile(file)}
                >
                  {file.mime_type.startsWith('image/') ? (
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <Image
                        src={file.url}
                        alt={file.alt_text || file.original_name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-base-300 rounded flex-shrink-0">
                      {getFileIcon(file.mime_type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.original_name}</p>
                    <p className="text-xs text-base-content/60">
                      {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filesResponse?.meta && filesResponse.meta.last_page > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              className="btn btn-sm"
              onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
              disabled={filters.page === 1}
            >
              Previous
            </button>
            <span className="flex items-center px-3 text-sm">
              Page {filesResponse.meta.current_page} of {filesResponse.meta.last_page}
            </span>
            <button
              className="btn btn-sm"
              onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
              disabled={filters.page === filesResponse.meta.last_page}
            >
              Next
            </button>
          </div>
        )}

        {/* Footer with selected file info */}
        <div className="modal-action justify-between">
          <div className="flex-1">
            {selectedFile && (
              <div className="text-sm text-base-content/70">
                Selected: {selectedFile.original_name}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleInsertFile}
              disabled={!selectedFile}
            >
              Insert File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}