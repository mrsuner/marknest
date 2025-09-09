interface FilesErrorProps {
  error: string;
  onDismiss: () => void;
}

export function FilesError({ error, onDismiss }: FilesErrorProps) {
  return (
    <div className="alert alert-error mb-6">
      <svg className="w-6 h-6 stroke-current shrink-0" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="flex-1">
        {error.split('\n').map((line, index) => (
          <div key={index} className={index > 0 ? 'mt-1' : ''}>
            {line}
          </div>
        ))}
      </div>
      <button 
        className="btn btn-sm btn-ghost" 
        onClick={onDismiss}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}