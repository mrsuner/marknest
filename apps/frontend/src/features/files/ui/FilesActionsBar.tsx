interface FilesActionsBarProps {
  selectedCount: number;
  onBulkDelete: () => void;
}

export function FilesActionsBar({ selectedCount, onBulkDelete }: FilesActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-base-100 rounded-lg border border-base-300 p-4 mb-6 flex items-center justify-between">
      <span className="text-sm text-base-content">
        {selectedCount} file{selectedCount > 1 ? 's' : ''} selected
      </span>
      <div className="flex items-center gap-2">
        <button 
          className="btn btn-sm btn-error btn-outline"
          onClick={onBulkDelete}
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
  );
}