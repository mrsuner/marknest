'use client';

import { useState } from 'react';
import ShareModal from '@/components/modals/ShareModal';
import {
  useShareSelection,
  useBulkActions,
  useShareActions,
  useGetDocumentSharesQuery,
  SharesTableDesktop,
  SharesCardsMobile,
  SharesEmptyState,
  SharesError,
  SharesLoading,
  SharesFilters,
  SharesHeader,
  SharesPagination,
  EditShareModal,
} from '@/src/features/shared-links';
import type { DocumentShare } from '@/src/features/shared-links';

export default function SharedLinksPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingShare, setEditingShare] = useState<DocumentShare | null>(null);
  const [showNewShareModal, setShowNewShareModal] = useState(false);
  const [newShareDocumentName, setNewShareDocumentName] = useState('');

  // Domain hooks
  const { selectedShares, toggleShareSelection, selectAllShares, clearSelection } = useShareSelection();
  const { handleBulkAction } = useBulkActions();
  const { handleDeleteShare } = useShareActions();

  // Data fetching
  const { data, isLoading, error, refetch } = useGetDocumentSharesQuery({
    page: currentPage,
    per_page: 15,
  });

  const shares = data?.data || [];
  const totalPages = data?.last_page || 1;

  // Event handlers
  const handleEditShare = (share: DocumentShare) => {
    setEditingShare(share);
  };

  const handleCloseEditModal = () => {
    setEditingShare(null);
  };

  const handleNewShareCreated = async () => {
    setShowNewShareModal(false);
    setNewShareDocumentName('');
    // Refetch data to show the new share
    refetch();
    // TODO: Show success toast notification
  };

  const handleBulkActionClick = async (action: 'activate' | 'deactivate' | 'delete') => {
    try {
      await handleBulkAction(Array.from(selectedShares), action);
      clearSelection();
      refetch();
    } catch {
      // Error already logged in hook
    }
  };

  const handleDeleteShareClick = async (shareId: string) => {
    try {
      await handleDeleteShare(shareId);
      refetch();
    } catch {
      // Error already logged in hook
    }
  };

  const handleToggleAllSelection = (checked: boolean) => {
    if (checked) {
      selectAllShares(shares.map(s => s.id));
    } else {
      clearSelection();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNewShare = () => {
    setNewShareDocumentName('Sample Document'); // TODO: Replace with actual document selection
    setShowNewShareModal(true);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <SharesHeader 
        selectedCount={selectedShares.size}
        onBulkAction={handleBulkActionClick}
        onNewShare={handleNewShare}
      />
      
      <SharesFilters onNewShare={handleNewShare} />
      
      {error && (
        <SharesError 
          error={error.toString()}
          onRetry={() => refetch()}
        />
      )}
      
      {isLoading && <SharesLoading />}
      
      {!isLoading && !error && shares.length === 0 && (
        <SharesEmptyState onCreateShare={handleNewShare} />
      )}
      
      {!isLoading && !error && shares.length > 0 && (
        <>
          <SharesTableDesktop
            shares={shares}
            selectedShares={selectedShares}
            onToggleSelection={toggleShareSelection}
            onToggleAll={handleToggleAllSelection}
            onEditShare={handleEditShare}
            onDeleteShare={handleDeleteShareClick}
          />
          
          <SharesCardsMobile
            shares={shares}
            selectedShares={selectedShares}
            onToggleSelection={toggleShareSelection}
            onEditShare={handleEditShare}
            onDeleteShare={handleDeleteShareClick}
          />
          
          <SharesPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
      
      <EditShareModal
        share={editingShare}
        isOpen={!!editingShare}
        onClose={handleCloseEditModal}
      />
      
      {newShareDocumentName && (
        <ShareModal
          isOpen={showNewShareModal}
          onClose={() => {
            setShowNewShareModal(false);
            setNewShareDocumentName('');
          }}
          documentId="sample_doc_id" // TODO: Replace with actual document ID
          documentName={newShareDocumentName}
          onShareCreated={handleNewShareCreated}
        />
      )}
    </div>
  );
}