interface FileItemActionsProps {
  fileId: string;
  fileName: string;
  onDownload: (fileId: string, fileName: string) => void;
  onDelete: (fileId: string) => void;
}

export function FileItemActions({ fileId, fileName, onDownload, onDelete }: FileItemActionsProps) {
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-square">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </div>
      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32 border border-base-300">
        <li>
          <a onClick={() => onDownload(fileId, fileName)}>
            Download
          </a>
        </li>
        <li><a>Rename</a></li>
        <li><a>Share</a></li>
        <li><hr className="my-1" /></li>
        <li>
          <a 
            className="text-error" 
            onClick={() => onDelete(fileId)}
          >
            Delete
          </a>
        </li>
      </ul>
    </div>
  );
}