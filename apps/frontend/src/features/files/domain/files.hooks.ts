import { useState, useCallback } from 'react';
import { useGetFilesQuery, useUploadFilesMutation, useDeleteFileMutation, useDownloadFileMutation } from './files.api';
import { FileFilters, UploadLimits, UploadMetadata } from './files.types';

export const useFilesManagement = (initialFilters: FileFilters = {}) => {
  const [filters, setFilters] = useState<FileFilters>(initialFilters);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [uploadLimits, setUploadLimits] = useState<UploadLimits | null>(null);

  const {
    data: filesResponse,
    isLoading,
    error: fetchError,
    refetch,
  } = useGetFilesQuery(filters);

  const [uploadFiles, { isLoading: isUploading }] = useUploadFilesMutation();
  const [deleteFile] = useDeleteFileMutation();
  const [downloadFile] = useDownloadFileMutation();

  const updateFilters = useCallback((newFilters: Partial<FileFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const updateSearch = useCallback((search: string) => {
    updateFilters({ search });
  }, [updateFilters]);

  const toggleFileSelection = useCallback((fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  const handleUpload = useCallback(async (files: File[], metadata?: UploadMetadata) => {
    try {
      const response = await uploadFiles({ files, metadata }).unwrap();
      
      // Store upload limits if available
      if (response.limits) {
        setUploadLimits(response.limits);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }, [uploadFiles]);

  const handleDelete = useCallback(async (fileId: string) => {
    try {
      await deleteFile(fileId).unwrap();
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    } catch (error) {
      throw error;
    }
  }, [deleteFile]);

  const handleBulkDelete = useCallback(async () => {
    try {
      const promises = Array.from(selectedFiles).map(fileId => 
        deleteFile(fileId).unwrap()
      );
      await Promise.all(promises);
      setSelectedFiles(new Set());
    } catch (error) {
      throw error;
    }
  }, [selectedFiles, deleteFile]);

  const handleDownload = useCallback(async (fileId: string, filename?: string) => {
    try {
      const blob = await downloadFile(fileId).unwrap();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw error;
    }
  }, [downloadFile]);

  return {
    // Data
    files: filesResponse?.data || [],
    pagination: filesResponse?.meta,
    uploadLimits,
    selectedFiles,
    filters,
    
    // State
    isLoading,
    isUploading,
    error: fetchError,
    
    // Actions
    updateFilters,
    updateSearch,
    toggleFileSelection,
    clearSelection,
    handleUpload,
    handleDelete,
    handleBulkDelete,
    handleDownload,
    refetch,
    
    // Setters
    setUploadLimits,
  };
};