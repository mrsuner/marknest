'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FolderItem {
  id: string;
  name: string;
  type: 'folder' | 'document';
  size?: string;
  modified: string;
  shared?: boolean;
}

interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}

export default function FoldersPage() {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [currentPath, setCurrentPath] = useState<BreadcrumbItem[]>([
    { id: 'root', name: 'My Drive', path: '/' }
  ]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'folder' | 'document'>('folder');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Mock data - replace with actual API data
  const [items, setItems] = useState<FolderItem[]>([
    {
      id: '1',
      name: 'Project Documentation',
      type: 'folder',
      modified: '2 days ago',
    },
    {
      id: '2',
      name: 'Meeting Notes',
      type: 'folder',
      modified: '1 week ago',
    },
    {
      id: '3',
      name: 'README.md',
      type: 'document',
      size: '2.3 KB',
      modified: '3 hours ago',
    },
    {
      id: '4',
      name: 'Architecture Overview.md',
      type: 'document',
      size: '8.1 KB',
      modified: '1 day ago',
      shared: true,
    },
    {
      id: '5',
      name: 'Personal Notes',
      type: 'folder',
      modified: '5 days ago',
    },
    {
      id: '6',
      name: 'Quick Ideas.md',
      type: 'document',
      size: '1.2 KB',
      modified: '2 hours ago',
    },
  ]);

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleItemDoubleClick = (item: FolderItem) => {
    if (item.type === 'folder') {
      // Navigate to folder
      setCurrentPath(prev => [...prev, { id: item.id, name: item.name, path: `${prev[prev.length - 1].path}${item.name}/` }]);
      // In real app, this would fetch folder contents
    } else {
      // Open document for editing
      console.log('Opening document:', item.name);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(prev => prev.slice(0, index + 1));
    // In real app, this would fetch contents for the selected path
  };

  const handleCreate = () => {
    // Mock creation - in real app this would call API
    const newItem: FolderItem = {
      id: Date.now().toString(),
      name: createType === 'folder' ? 'New Folder' : 'New Document.md',
      type: createType,
      modified: 'Just now',
      ...(createType === 'document' && { size: '0 KB' })
    };
    setItems(prev => [newItem, ...prev]);
    setShowCreateModal(false);
  };

  const handleDelete = () => {
    setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  // Filter items based on search query
  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(query);
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(query.length > 0);
    setSelectedItems([]); // Clear selections when searching
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-base-content mb-2">Folders</h1>
          
          {/* Breadcrumb */}
          <div className="breadcrumbs text-sm">
            <ul>
              {currentPath.map((crumb, index) => (
                <li key={crumb.id}>
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className="hover:text-primary transition-colors"
                    disabled={index === currentPath.length - 1}
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
              onClick={() => setViewType('grid')}
              className={`btn btn-sm join-item ${viewType === 'grid' ? 'btn-active' : 'btn-outline'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`btn btn-sm join-item ${viewType === 'list' ? 'btn-active' : 'btn-outline'}`}
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
                <button onClick={() => { setCreateType('folder'); setShowCreateModal(true); }}>
                  <FolderIcon />
                  New Folder
                </button>
              </li>
              <li>
                <button onClick={() => { setCreateType('document'); setShowCreateModal(true); }}>
                  <DocumentIcon />
                  New Document
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search Results Indicator */}
      {isSearching && (
        <div className="mb-4 p-3 bg-info/10 rounded-lg border border-info/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm">
                Found {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} matching "{searchQuery}"
              </span>
            </div>
            <button onClick={clearSearch} className="btn btn-ghost btn-xs">
              Clear search
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      {selectedItems.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl mb-4">
          <span className="text-sm font-medium">
            {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button className="btn btn-sm btn-ghost">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
              </svg>
              Share
            </button>
            <button onClick={handleDelete} className="btn btn-sm btn-ghost text-error">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          {isSearching ? (
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
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary btn-sm"
              >
                Create New
              </button>
            </>
          )}
        </div>
      ) : viewType === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredItems.map((item) => (
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
                  <span>{item.modified}</span>
                  {item.shared && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
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
              checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
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
          {filteredItems.map((item) => (
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
                </div>
                <div className="col-span-2 text-sm text-base-content/60">
                  {item.size || '—'}
                </div>
                <div className="col-span-3 text-sm text-base-content/60">
                  {item.modified}
                </div>
                <div className="col-span-1">
                  {item.shared && (
                    <svg className="w-4 h-4 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              Create New {createType === 'folder' ? 'Folder' : 'Document'}
            </h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                placeholder={createType === 'folder' ? 'Folder name' : 'Document name'}
                className="input input-bordered"
                defaultValue={createType === 'folder' ? 'New Folder' : 'New Document.md'}
              />
            </div>
            <div className="modal-action">
              <button onClick={() => setShowCreateModal(false)} className="btn">
                Cancel
              </button>
              <button onClick={handleCreate} className="btn btn-primary">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}