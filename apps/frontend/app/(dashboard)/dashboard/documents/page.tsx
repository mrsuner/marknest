'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { 
  useGetFolderContentsQuery, 
  useCreateFolderMutation,
  useDeleteFolderMutation,
  useLazySearchFoldersQuery,
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  type FolderContentsItem
} from '@/lib/store/api/api';
import { useDuplicateDocumentMutation } from '@/lib/store/api/documentsApi';
import {
  setViewMode,
  setCurrentFolder,
  setSearchQuery,
  clearSearchQuery,
  selectItem,
  deselectItem,
  selectAll,
  clearSelection,
  openCreateFolderModal,
  closeCreateFolderModal,
  openCreateDocumentModal,
  closeCreateDocumentModal,
  openDeleteConfirm,
  closeDeleteConfirm,
} from '@/lib/store/slices/uiSlice';
import { useState } from 'react';
import ShareModal from '@/components/modals/ShareModal';
import { type DocumentShare } from '@/lib/store/api/documentSharesApi';

export default function DocumentsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Redux state
  const {
    viewMode,
    currentFolderId,
    searchQuery,
    selectedItems,
  } = useAppSelector((state) => state.ui.folders);
  
  const {
    createFolder: createFolderModalOpen,
    createDocument: createDocumentModalOpen,
    deleteConfirm,
  } = useAppSelector((state) => state.ui.modals);

  // Local state
  const [newItemName, setNewItemName] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareDocumentId, setShareDocumentId] = useState<string | null>(null);
  const [shareDocumentName, setShareDocumentName] = useState<string>('');
  const [duplicateConfirmId, setDuplicateConfirmId] = useState<string | null>(null);
  const [duplicateConfirmName, setDuplicateConfirmName] = useState<string>('');

  // RTK Query hooks
  const {
    data: folderContents,
    error: folderError,
    isLoading: isLoadingContents,
    refetch: refetchContents,
  } = useGetFolderContentsQuery(currentFolderId);

  const [createFolder, { isLoading: isCreatingFolder }] = useCreateFolderMutation();
  const [createDocument, { isLoading: isCreatingDocument }] = useCreateDocumentMutation();
  const [deleteFolder] = useDeleteFolderMutation();
  const [deleteDocument] = useDeleteDocumentMutation();
  const [duplicateDocument, { isLoading: isDuplicating }] = useDuplicateDocumentMutation();
  
  const [searchFolders, { data: searchResults, isLoading: isSearching }] = useLazySearchFoldersQuery();

  // Memoized filtered items
  const items: FolderContentsItem[] = useMemo(() => {
    if (searchQuery && searchResults) {
      // Map search results to FolderContentsItem format
      return searchResults.data.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        modified: item.modified,
        size: item.size,
        // Add default values for missing properties
        documentCount: undefined,
        color: undefined,
        icon: undefined,
        shared: false,
        favorite: false,
      }));
    }
    return folderContents?.data?.items || [];
  }, [searchQuery, searchResults, folderContents]);

  const breadcrumbs = useMemo(() => {
    return folderContents?.data?.breadcrumbs || [{ id: 'root', name: 'My Drive', path: '/' }];
  }, [folderContents]);

  // Search effect with debouncing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        searchFolders({ query: searchQuery });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchFolders]);

  // Handle authentication errors
  useEffect(() => {
    if (folderError && 'status' in folderError && folderError.status === 401) {
      router.push('/login');
    }
  }, [folderError, router]);

  // Event handlers
  const handleItemSelect = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      dispatch(deselectItem(itemId));
    } else {
      dispatch(selectItem(itemId));
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      dispatch(clearSelection());
    } else {
      dispatch(selectAll(items.map(item => item.id)));
    }
  };

  const handleItemDoubleClick = (item: FolderContentsItem) => {
    if (item.type === 'folder') {
      dispatch(setCurrentFolder(item.id));
      dispatch(clearSelection());
    } else {
      router.push(`/dashboard/documents/${item.id}/edit`);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const breadcrumb = breadcrumbs[index];
    if (breadcrumb.id === 'root') {
      dispatch(setCurrentFolder(null));
    } else {
      dispatch(setCurrentFolder(breadcrumb.id));
    }
    dispatch(clearSelection());
  };

  const handleCreate = async () => {
    if (!newItemName.trim()) return;
    
    try {
      if (createFolderModalOpen) {
        await createFolder({
          name: newItemName,
          parent_id: currentFolderId,
        }).unwrap();
        dispatch(closeCreateFolderModal());
      } else if (createDocumentModalOpen) {
        await createDocument({
          title: newItemName,
          folder_id: currentFolderId,
          content: '',
        }).unwrap();
        dispatch(closeCreateDocumentModal());
      }
      
      setNewItemName('');
      refetchContents();
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to create item');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.itemId || !deleteConfirm.itemType) return;

    try {
      if (deleteConfirm.itemType === 'folder') {
        await deleteFolder({ id: deleteConfirm.itemId }).unwrap();
      } else {
        await deleteDocument(deleteConfirm.itemId).unwrap();
      }
      
      dispatch(closeDeleteConfirm());
      dispatch(clearSelection());
      refetchContents();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    
    const firstItem = items.find(item => item.id === selectedItems[0]);
    if (firstItem) {
      dispatch(openDeleteConfirm({
        id: selectedItems[0],
        name: selectedItems.length > 1 ? `${selectedItems.length} items` : firstItem.name,
        type: firstItem.type,
      }));
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    dispatch(setSearchQuery(query));
    dispatch(clearSelection());
  };

  const clearSearch = () => {
    dispatch(clearSearchQuery());
  };

  const handleShareClick = () => {
    if (selectedItems.length === 1) {
      const selectedItem = items.find(item => item.id === selectedItems[0]);
      if (selectedItem && selectedItem.type === 'document') {
        setShareDocumentId(selectedItem.id);
        setShareDocumentName(selectedItem.name);
        setShareModalOpen(true);
      }
    }
  };

  const handleShareCreated = (shareData: DocumentShare) => {
    console.log('Share created:', shareData);
    // TODO: Show success toast notification
    // TODO: Navigate to shared links page or refresh data
  };

  const handleDuplicateClick = () => {
    if (selectedItems.length === 1) {
      const selectedItem = items.find(item => item.id === selectedItems[0]);
      if (selectedItem && selectedItem.type === 'document') {
        setDuplicateConfirmId(selectedItem.id);
        setDuplicateConfirmName(selectedItem.name);
      }
    }
  };

  const handleDuplicateConfirm = async () => {
    if (!duplicateConfirmId) return;
    
    try {
      const result = await duplicateDocument(duplicateConfirmId).unwrap();
      // Navigate to the duplicated document
      router.push(`/dashboard/documents/${result.data.id}/edit`);
      setDuplicateConfirmId(null);
      setDuplicateConfirmName('');
      dispatch(clearSelection());
    } catch (error) {
      console.error('Failed to duplicate document:', error);
      // TODO: Show error toast notification
      setDuplicateConfirmId(null);
      setDuplicateConfirmName('');
    }
  };

  // Component icons
  const FolderIcon = () => (
    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
      <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
    </svg>
  );

  const DocumentIcon = () => (
    <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const isLoading = isLoadingContents || isSearching;
  const isSearchActive = searchQuery.length > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-base-content mb-2">Documents</h1>
          
          {/* Breadcrumb */}
          <div className="breadcrumbs text-sm">
            <ul>
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.id}>
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className="hover:text-primary transition-colors"
                    disabled={index === breadcrumbs.length - 1}
                  >
                    {crumb.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search folders and documents..."
              value={searchQuery}
              onChange={handleSearch}
              className="input input-bordered input-sm w-64 pr-10"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {!searchQuery && (
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>

          {/* View Toggle */}
          <div className="join">
            <button
              onClick={() => dispatch(setViewMode('grid'))}
              className={`btn btn-sm join-item ${viewMode === 'grid' ? 'btn-active' : 'btn-outline'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => dispatch(setViewMode('list'))}
              className={`btn btn-sm join-item ${viewMode === 'list' ? 'btn-active' : 'btn-outline'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Create Dropdown */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-primary btn-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40 border border-base-300">
              <li>
                <button onClick={() => dispatch(openCreateFolderModal())}>
                  <FolderIcon />
                  New Folder
                </button>
              </li>
              <li>
                <button onClick={() => dispatch(openCreateDocumentModal())}>
                  <DocumentIcon />
                  New Document
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search Results Indicator */}
      {isSearchActive && (
        <div className="mb-4 p-3 bg-info/10 rounded-lg border border-info/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm">
                Found {items.length} {items.length === 1 ? 'item' : 'items'} matching &ldquo;{searchQuery}&rdquo;
              </span>
            </div>
            <button onClick={clearSearch} className="btn btn-ghost btn-xs">
              Clear search
            </button>
          </div>
        </div>
      )}

      {/* Toolbar - Always reserves space to prevent layout shift */}
      <div className="mb-4 h-16">
        <div className={`transition-all duration-200 ${selectedItems.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
          <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl">
            <span className="text-sm font-medium">
              {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button 
                onClick={handleShareClick}
                className="btn btn-sm btn-ghost"
                disabled={selectedItems.length !== 1 || (selectedItems.length === 1 && items.find(item => item.id === selectedItems[0])?.type !== 'document')}
                title={selectedItems.length !== 1 ? "Select exactly one document to share" : 
                       items.find(item => item.id === selectedItems[0])?.type !== 'document' ? "Only documents can be shared" : 
                       "Create share link"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15V3m0 0l-4 4m4-4l4 4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" />
                </svg>
                Share
              </button>
              <button 
                onClick={handleDuplicateClick}
                className="btn btn-sm btn-ghost"
                disabled={selectedItems.length !== 1 || (selectedItems.length === 1 && items.find(item => item.id === selectedItems[0])?.type !== 'document')}
                title={selectedItems.length !== 1 ? "Select exactly one document to duplicate" : 
                       items.find(item => item.id === selectedItems[0])?.type !== 'document' ? "Only documents can be duplicated" : 
                       "Duplicate document"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate
              </button>
              <button onClick={handleDeleteSelected} className="btn btn-sm btn-ghost text-error">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          {isSearchActive ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-base-200 rounded-full mb-4">
                <svg className="w-8 h-8 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-base-content mb-2">No results found</h3>
              <p className="text-base-content/60 mb-4">Try adjusting your search terms</p>
              <button 
                onClick={clearSearch}
                className="btn btn-primary btn-sm"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-base-200 rounded-full mb-4">
                <FolderIcon />
              </div>
              <h3 className="text-lg font-medium text-base-content mb-2">No items in this folder</h3>
              <p className="text-base-content/60 mb-4">Create your first folder or document to get started</p>
              <button 
                onClick={() => dispatch(openCreateFolderModal())}
                className="btn btn-primary btn-sm"
              >
                Create New
              </button>
            </>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                selectedItems.includes(item.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-base-300 hover:border-base-400'
              }`}
              onClick={() => handleItemSelect(item.id)}
              onDoubleClick={() => handleItemDoubleClick(item)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-3">
                  {item.type === 'folder' ? <FolderIcon /> : <DocumentIcon />}
                </div>
                <h3 className="text-sm font-medium text-base-content mb-1 line-clamp-2">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-base-content/60">
                  {item.size && <span>{item.size}</span>}
                  {item.documentCount !== undefined && item.type === 'folder' && (
                    <span>{item.documentCount} items</span>
                  )}
                  <span>{item.modified}</span>
                  {item.shared && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0112 21c4.474 0 8.268-3.12 9.032-7.326" />
                    </svg>
                  )}
                  {item.favorite && (
                    <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  )}
                </div>
              </div>
              
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => handleItemSelect(item.id)}
                className="absolute top-2 left-2 checkbox checkbox-primary checkbox-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-base-100 rounded-xl border border-base-300 overflow-hidden">
          {/* List Header */}
          <div className="flex items-center p-4 border-b border-base-300 bg-base-50">
            <input
              type="checkbox"
              checked={selectedItems.length === items.length && items.length > 0}
              onChange={handleSelectAll}
              className="checkbox checkbox-primary checkbox-sm mr-4"
            />
            <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-base-content/60">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-3">Modified</div>
              <div className="col-span-1">Shared</div>
            </div>
          </div>
          
          {/* List Items */}
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center p-4 border-b border-base-300 last:border-b-0 hover:bg-base-50 cursor-pointer transition-colors ${
                selectedItems.includes(item.id) ? 'bg-primary/5' : ''
              }`}
              onClick={() => handleItemSelect(item.id)}
              onDoubleClick={() => handleItemDoubleClick(item)}
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => handleItemSelect(item.id)}
                className="checkbox checkbox-primary checkbox-sm mr-4"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1 grid grid-cols-12 gap-4">
                <div className="col-span-6 flex items-center gap-3">
                  {item.type === 'folder' ? <FolderIcon /> : <DocumentIcon />}
                  <span className="font-medium text-base-content">{item.name}</span>
                  {item.favorite && (
                    <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  )}
                </div>
                <div className="col-span-2 text-sm text-base-content/60">
                  {item.size || (item.documentCount !== undefined && item.type === 'folder' ? `${item.documentCount} items` : '—')}
                </div>
                <div className="col-span-3 text-sm text-base-content/60">
                  {item.modified}
                </div>
                <div className="col-span-1">
                  {item.shared && (
                    <svg className="w-4 h-4 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0112 21c4.474 0 8.268-3.12 9.032-7.326" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Folder Modal */}
      {createFolderModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create New Folder</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                placeholder="Folder name"
                className="input input-bordered"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
                autoFocus
              />
            </div>
            <div className="modal-action">
              <button onClick={() => {
                dispatch(closeCreateFolderModal());
                setNewItemName('');
              }} className="btn">
                Cancel
              </button>
              <button 
                onClick={handleCreate} 
                className="btn btn-primary"
                disabled={!newItemName.trim() || isCreatingFolder}
              >
                {isCreatingFolder ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Document Modal */}
      {createDocumentModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create New Document</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                placeholder="Document name"
                className="input input-bordered"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
                autoFocus
              />
            </div>
            <div className="modal-action">
              <button onClick={() => {
                dispatch(closeCreateDocumentModal());
                setNewItemName('');
              }} className="btn">
                Cancel
              </button>
              <button 
                onClick={handleCreate} 
                className="btn btn-primary"
                disabled={!newItemName.trim() || isCreatingDocument}
              >
                {isCreatingDocument ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirm Deletion</h3>
            <p className="mb-4">
              Are you sure you want to delete &ldquo;{deleteConfirm.itemName}&rdquo;? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button 
                onClick={() => dispatch(closeDeleteConfirm())} 
                className="btn"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm} 
                className="btn btn-error"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareDocumentId && shareDocumentName && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setShareDocumentId(null);
            setShareDocumentName('');
          }}
          documentId={shareDocumentId}
          documentName={shareDocumentName}
          onShareCreated={handleShareCreated}
        />
      )}

      {/* Duplicate Confirmation Modal */}
      {duplicateConfirmId && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Duplicate Document</h3>
            <p className="mb-4">
              Are you sure you want to create a duplicate of &ldquo;{duplicateConfirmName}&rdquo;?
            </p>
            <p className="text-sm text-base-content/60 mb-4">
              A new document titled &ldquo;Copy of {duplicateConfirmName}&rdquo; will be created and you&apos;ll be redirected to edit it.
            </p>
            <div className="modal-action">
              <button 
                onClick={() => {
                  setDuplicateConfirmId(null);
                  setDuplicateConfirmName('');
                }} 
                className="btn"
                disabled={isDuplicating}
              >
                Cancel
              </button>
              <button 
                onClick={handleDuplicateConfirm} 
                className="btn btn-primary"
                disabled={isDuplicating}
              >
                {isDuplicating ? 'Duplicating...' : 'Duplicate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}