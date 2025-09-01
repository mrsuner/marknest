'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { filesAPI, MediaFile, FileFilters } from '@/lib/api/files';

type ViewMode = 'grid' | 'list';

export default function FilesPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load files from API
  const loadFiles = useCallback(async (filters: FileFilters = {}) => {
    try {
      setError(null);
      const response = await filesAPI.getFiles(filters);
      setFiles(response.data);
      setPagination(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
      console.error('Error loading files:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load files on component mount
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        loadFiles({ search: searchQuery });
      } else {
        loadFiles();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadFiles]);

  // Drag and drop functionality
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    setError(null);
    
    try {
      const response = await filesAPI.uploadFiles(acceptedFiles);
      
      if (response.success) {
        // Refresh files list
        await loadFiles();
        
        // Show success message
        const successCount = response.summary.successful;
        const failedCount = response.summary.failed;
        
        if (failedCount > 0) {
          setError(`Uploaded ${successCount} files successfully, ${failedCount} failed`);
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }, [loadFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: true,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md', '.csv'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  });

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size > 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
  };

  const getFileIcon = (mimeType: string, extension: string) => {
    if (mimeType.startsWith('image/')) {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      );
    }
    
    if (mimeType === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      );
    }
    
    // Default file icon
    return (
      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    );
  };

  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      setError(null);
      await filesAPI.deleteFile(fileId);
      await loadFiles(); // Refresh the list
      setSelectedFiles(prev => {
        const updated = new Set(prev);
        updated.delete(fileId);
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    }
  };

  const handleBulkDelete = async () => {
    try {
      setError(null);
      const promises = Array.from(selectedFiles).map(fileId => 
        filesAPI.deleteFile(fileId)
      );
      await Promise.all(promises);
      await loadFiles(); // Refresh the list
      setSelectedFiles(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete files');
    }
  };

  const handleDownloadFile = async (fileId: string) => {
    try {
      setError(null);
      await filesAPI.downloadFile(fileId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file');
    }
  };

  const filteredFiles = files;

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100">
      <div className="container mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-base-content mb-2">Files</h1>
            <p className="text-base-content/60">Manage your uploaded media files and assets</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="form-control">
              <input
                type="text"
                placeholder="Search files..."
                className="input input-bordered w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* View Toggle */}
            <div className="join">
              <button
                className={`btn join-item ${viewMode === 'grid' ? 'btn-active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                className={`btn join-item ${viewMode === 'list' ? 'btn-active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            {/* Upload Button */}
            <button
              className="btn btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Files
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6">
            <svg className="w-6 h-6 stroke-current shrink-0" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
            <button 
              className="btn btn-sm btn-ghost" 
              onClick={() => setError(null)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Actions Bar */}
        {selectedFiles.size > 0 && (
          <div className="bg-base-100 rounded-lg border border-base-300 p-4 mb-6 flex items-center justify-between">
            <span className="text-sm text-base-content">
              {selectedFiles.size} file{selectedFiles.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button 
                className="btn btn-sm btn-error btn-outline"
                onClick={handleBulkDelete}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
              <button className="btn btn-sm btn-outline">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
        )}

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-base-300 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} ref={fileInputRef} />
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-base-200 rounded-full">
              <svg className="w-8 h-8 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-base-content mb-1">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-base-content/60">
                or <span className="text-primary cursor-pointer">browse files</span> to upload
              </p>
              <p className="text-xs text-base-content/40 mt-2">
                Supports images, PDFs, documents and more
              </p>
            </div>
          </div>
        </div>

        {/* Files Display */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
            <h3 className="text-lg font-medium text-base-content mb-1">Loading files...</h3>
            <p className="text-base-content/60">Please wait while we fetch your files</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-base-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-base-content mb-1">No files yet</h3>
            <p className="text-base-content/60">Upload your first file to get started</p>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' 
              : 'space-y-2'
          }`}>
            {filteredFiles.map((file) => (
              <div key={file.id} className={`${
                viewMode === 'grid'
                  ? 'bg-base-100 rounded-lg border border-base-300 p-4 hover:shadow-lg transition-shadow cursor-pointer'
                  : 'bg-base-100 rounded-lg border border-base-300 p-4 hover:bg-base-200 transition-colors cursor-pointer flex items-center gap-4'
              } ${selectedFiles.has(file.id) ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
                
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                      />
                      <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-square">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </div>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32 border border-base-300">
                          <li>
                            <a onClick={() => handleDownloadFile(file.id)}>
                              Download
                            </a>
                          </li>
                          <li><a>Rename</a></li>
                          <li><a>Share</a></li>
                          <li><hr className="my-1" /></li>
                          <li>
                            <a 
                              className="text-error" 
                              onClick={() => handleDeleteFile(file.id)}
                            >
                              Delete
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      {file.mime_type.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.alt_text || file.original_name}
                          className="w-16 h-16 object-cover rounded-lg mb-3"
                        />
                      ) : (
                        <div className="mb-3">
                          {getFileIcon(file.mime_type, file.file_extension)}
                        </div>
                      )}
                      
                      <h3 className="font-medium text-sm text-base-content mb-1 truncate w-full" title={file.original_name}>
                        {file.original_name}
                      </h3>
                      <p className="text-xs text-base-content/60">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectedFiles.has(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                    />
                    
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {file.mime_type.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.alt_text || file.original_name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        getFileIcon(file.mime_type, file.file_extension)
                      )}
                      
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-base-content truncate" title={file.original_name}>
                          {file.original_name}
                        </h3>
                        <p className="text-sm text-base-content/60">
                          {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="dropdown dropdown-end">
                      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-square">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </div>
                      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32 border border-base-300">
                        <li>
                          <a onClick={() => handleDownloadFile(file.id)}>
                            Download
                          </a>
                        </li>
                        <li><a>Rename</a></li>
                        <li><a>Share</a></li>
                        <li><hr className="my-1" /></li>
                        <li>
                          <a 
                            className="text-error" 
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            Delete
                          </a>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}