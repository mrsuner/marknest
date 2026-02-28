"use client";

interface SharesHeaderProps {
  selectedCount: number;
  onBulkAction: (action: 'activate' | 'deactivate' | 'delete') => void;
  onNewShare: () => void;
}

export function SharesHeader({ selectedCount, onBulkAction, onNewShare }: SharesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-base-content">Shared Links</h1>
        <p className="text-base-content/60 mt-1">Manage your document sharing links</p>
      </div>
      
      <div className="flex gap-2">
        {selectedCount > 0 && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-outline btn-sm">
              Bulk Actions ({selectedCount})
            </div>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40">
              <li><button onClick={() => onBulkAction('activate')}>Enable Selected</button></li>
              <li><button onClick={() => onBulkAction('deactivate')}>Disable Selected</button></li>
              <li><button onClick={() => onBulkAction('delete')} className="text-error">Delete Selected</button></li>
            </ul>
          </div>
        )}
        <button 
          className="btn btn-primary btn-sm"
          onClick={onNewShare}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Share
        </button>
      </div>
    </div>
  );
}