'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  useFilesManagement,
  FilesDropzone,
  FilesHeader,
  FilesActionsBar,
  FilesGrid,
  FilesError,
  FilesLoading,
  formatFileSize,
  ViewMode,
  UploadResponseItem,
  UploadLimits
} from '@/features/files';

export default function FilesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    files,
    isLoading,
    isUploading,
    selectedFiles,
    uploadLimits,
    toggleFileSelection,
    handleUpload,
    handleDelete,
    handleBulkDelete,
    handleDownload,
    updateSearch,
    setUploadLimits,
  } = useFilesManagement();

  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    
    // Frontend validation - check file sizes
    if (uploadLimits) {
      const oversizedFiles = acceptedFiles.filter(file => file.size > uploadLimits.upload_size_limit);
      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles.map(f => `${f.name} (${formatFileSize(f.size)})`).join(', ');
        setError(`The following files exceed the ${uploadLimits.upload_size_limit_formatted} upload limit: ${fileNames}`);
        return;
      }
    }
    
    try {
      const response = await handleUpload(acceptedFiles);
      
      if (response.success) {
        const successCount = response.summary.successful;
        const failedCount = response.summary.failed;
        
        if (failedCount > 0) {
          if (response.data) {
            const failedFiles = response.data.filter((item: UploadResponseItem) => !item.success);
            if (failedFiles.length > 0) {
              const errorMessages = failedFiles.map((item: UploadResponseItem) => 
                `${item.original_name}: ${item.message}`
              ).join('\n');
              setError(`Upload partially failed:\n${errorMessages}`);
            } else {
              setError(`Uploaded ${successCount} files successfully, ${failedCount} failed`);
            }
          } else {
            setError(`Uploaded ${successCount} files successfully, ${failedCount} failed`);
          }
        }
      } else {
        if (response.errors && typeof response.errors === 'object') {
          const errorMessages = Object.entries(response.errors)
            .map(([field, messages]) => {
              const fileIndex = field.match(/files\.(\d+)/)?.[1];
              const fileName = fileIndex !== undefined ? acceptedFiles[parseInt(fileIndex)]?.name : field;
              return `${fileName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
            })
            .join('\n');
          
          let fullError = errorMessages;
          if (response.limits) {
            fullError += `\n\nUpload limit: ${response.limits.upload_size_limit_formatted}`;
            setUploadLimits(response.limits);
          }
          setError(fullError);
        } else {
          setError(response.message || 'Upload failed');
        }
      }
    } catch (err: unknown) {
      const errorData = (err as { data?: { errors?: Record<string, string | string[]>; message?: string; limits?: UploadLimits } })?.data;
      
      if (errorData?.errors && typeof errorData.errors === 'object') {
        const errorMessages = Object.entries(errorData.errors)
          .map(([field, messages]) => {
            const fileIndex = field.match(/files\.(\d+)/)?.[1];
            const fileName = fileIndex !== undefined ? acceptedFiles[parseInt(fileIndex)]?.name : field;
            return `${fileName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
          })
          .join('\n');
        
        let fullError = errorMessages;
        if (errorData.limits) {
          fullError += `\n\nUpload limit: ${errorData.limits.upload_size_limit_formatted}`;
          setUploadLimits(errorData.limits);
        }
        setError(fullError);
      } else if (errorData?.message) {
        setError(errorData.message);
      } else {
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    }
  }, [uploadLimits, handleUpload, setUploadLimits]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    updateSearch(query);
  }, [updateSearch]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileDownload = useCallback(async (fileId: string, fileName: string) => {
    try {
      setError(null);
      await handleDownload(fileId, fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file');
    }
  }, [handleDownload]);

  const handleFileDelete = useCallback(async (fileId: string) => {
    try {
      setError(null);
      await handleDelete(fileId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    }
  }, [handleDelete]);

  const handleBulkDeleteClick = useCallback(async () => {
    try {
      setError(null);
      await handleBulkDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete files');
    }
  }, [handleBulkDelete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100">
      <div className="container mx-auto px-6 lg:px-8 py-8">
        <FilesHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onUploadClick={handleUploadClick}
          isUploading={isUploading}
        />

        {error && (
          <FilesError 
            error={error} 
            onDismiss={() => setError(null)} 
          />
        )}

        <FilesActionsBar
          selectedCount={selectedFiles.size}
          onBulkDelete={handleBulkDeleteClick}
        />

        <div className="mb-6">
          <FilesDropzone
            onDrop={handleDrop}
            isUploading={isUploading}
            uploadLimits={uploadLimits}
          />
          <input 
            ref={fileInputRef} 
            type="file" 
            className="hidden" 
            multiple 
            accept="image/*,.pdf,.txt,.md,.csv,.doc,.docx"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                handleDrop(files);
              }
            }}
          />
        </div>

        {isLoading ? (
          <FilesLoading />
        ) : (
          <FilesGrid
            files={files}
            viewMode={viewMode}
            selectedFiles={selectedFiles}
            onFileSelect={toggleFileSelection}
            onDownload={handleFileDownload}
            onDelete={handleFileDelete}
          />
        )}
      </div>
    </div>
  );
}