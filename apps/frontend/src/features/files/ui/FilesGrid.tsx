import { MediaFile, ViewMode } from '../domain/files.types';
import { FileGridItem } from './FileGridItem';
import { FileListItem } from './FileListItem';

interface FilesGridProps {
  files: MediaFile[];
  viewMode: ViewMode;
  selectedFiles: Set<string>;
  onFileSelect: (fileId: string) => void;
  onDownload: (fileId: string, fileName: string) => void;
  onDelete: (fileId: string) => void;
}

export function FilesGrid({ 
  files, 
  viewMode, 
  selectedFiles, 
  onFileSelect, 
  onDownload, 
  onDelete 
}: FilesGridProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-base-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-base-content mb-1">No files yet</h3>
        <p className="text-base-content/60">Upload your first file to get started</p>
      </div>
    );
  }

  return (
    <div className={
      viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' 
        : 'space-y-2'
    }>
      {files.map((file) => (
        viewMode === 'grid' ? (
          <FileGridItem
            key={file.id}
            file={file}
            isSelected={selectedFiles.has(file.id)}
            onSelect={onFileSelect}
            onDownload={onDownload}
            onDelete={onDelete}
          />
        ) : (
          <FileListItem
            key={file.id}
            file={file}
            isSelected={selectedFiles.has(file.id)}
            onSelect={onFileSelect}
            onDownload={onDownload}
            onDelete={onDelete}
          />
        )
      ))}
    </div>
  );
}