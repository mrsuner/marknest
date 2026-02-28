import { useState, useCallback } from 'react';
import { useGetDocumentSharesQuery, useBulkUpdateDocumentSharesMutation, useDeleteDocumentShareMutation, useUpdateDocumentShareMutation } from './shared-links.api';
import type { DocumentSharesListParams, UpdateDocumentShareRequest, DocumentShare } from './shared-links.api';

export interface ShareFilters {
  searchQuery: string;
  statusFilter: string;
  accessFilter: string;
}

export const useShareFilters = () => {
  const [filters, setFilters] = useState<ShareFilters>({
    searchQuery: '',
    statusFilter: '',
    accessFilter: '',
  });

  const updateFilters = useCallback((newFilters: Partial<ShareFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    filters,
    updateFilters,
    setSearchQuery: (searchQuery: string) => updateFilters({ searchQuery }),
    setStatusFilter: (statusFilter: string) => updateFilters({ statusFilter }),
    setAccessFilter: (accessFilter: string) => updateFilters({ accessFilter }),
  };
};

export const useShareSelection = () => {
  const [selectedShares, setSelectedShares] = useState<Set<string>>(new Set());

  const toggleShareSelection = useCallback((shareId: string) => {
    setSelectedShares(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(shareId)) {
        newSelection.delete(shareId);
      } else {
        newSelection.add(shareId);
      }
      return newSelection;
    });
  }, []);

  const selectAllShares = useCallback((shareIds: string[]) => {
    setSelectedShares(new Set(shareIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedShares(new Set());
  }, []);

  return {
    selectedShares,
    toggleShareSelection,
    selectAllShares,
    clearSelection,
  };
};

export const useSharesWithFilters = (currentPage: number = 1) => {
  const { filters } = useShareFilters();
  
  const queryParams: DocumentSharesListParams = {
    page: currentPage,
    per_page: 15,
    ...(filters.searchQuery && { search: filters.searchQuery }),
    ...(filters.statusFilter && { status: filters.statusFilter as any }),
    ...(filters.accessFilter && { access_level: filters.accessFilter as any }),
  };

  return useGetDocumentSharesQuery(queryParams);
};

export const useBulkActions = () => {
  const [bulkUpdate] = useBulkUpdateDocumentSharesMutation();
  
  const handleBulkAction = useCallback(async (
    shareIds: string[], 
    action: 'activate' | 'deactivate' | 'delete'
  ) => {
    if (shareIds.length === 0) return;

    if (action === 'delete') {
      const confirmDelete = confirm(`Are you sure you want to delete ${shareIds.length} share(s)?`);
      if (!confirmDelete) return;
    }

    try {
      await bulkUpdate({
        share_ids: shareIds,
        action,
      }).unwrap();
      
      return true;
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
      throw error;
    }
  }, [bulkUpdate]);

  return { handleBulkAction };
};

export const useShareActions = () => {
  const [deleteShare] = useDeleteDocumentShareMutation();
  const [updateShare] = useUpdateDocumentShareMutation();

  const handleDeleteShare = useCallback(async (shareId: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this share?');
    if (!confirmDelete) return false;

    try {
      await deleteShare(shareId).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to delete share:', error);
      throw error;
    }
  }, [deleteShare]);

  const handleUpdateShare = useCallback(async (
    shareId: string, 
    data: UpdateDocumentShareRequest
  ) => {
    try {
      await updateShare({ id: shareId, data }).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to update share:', error);
      throw error;
    }
  }, [updateShare]);

  return {
    handleDeleteShare,
    handleUpdateShare,
  };
};

export const useShareUtils = () => {
  const copyToClipboard = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // TODO: Add toast notification
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  const getExpiryStatus = useCallback((expiresAt: string | null | undefined) => {
    if (!expiresAt) return { text: 'Never', className: 'badge-ghost' };
    
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Expired', className: 'badge-error' };
    if (diffDays <= 7) return { text: `${diffDays}d left`, className: 'badge-warning' };
    return { text: expiry.toLocaleDateString(), className: 'badge-ghost' };
  }, []);

  const getViewsProgress = useCallback((current: number, max: number | null | undefined) => {
    if (!max) return { percentage: 0, isNearLimit: false };
    const percentage = (current / max) * 100;
    return { percentage, isNearLimit: percentage > 80 };
  }, []);

  const getShareUrl = useCallback((share: DocumentShare) => {
    return share.short_url || `${window.location.origin}/share/${share.share_token}`;
  }, []);

  return {
    copyToClipboard,
    getExpiryStatus,
    getViewsProgress,
    getShareUrl,
  };
};