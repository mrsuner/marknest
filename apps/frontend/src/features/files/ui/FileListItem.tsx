import { MediaFile } from '../domain/files.types';
import { formatFileSize } from '../domain/files.utils';
import { FileIcon } from './FileIcon';
import { FileItemActions } from './FileItemActions';

interface FileListItemProps {
  file: MediaFile;
  isSelected: boolean;
  onSelect: (fileId: string) => void;
  onDownload: (fileId: string, fileName: string) => void;
  onDelete: (fileId: string) => void;
}

export function FileListItem({ file, isSelected, onSelect, onDownload, onDelete }: FileListItemProps) {
  return (
    <div className={`bg-base-100 rounded-lg border border-base-300 p-4 hover:bg-base-200 transition-colors cursor-pointer flex items-center gap-4 ${
      isSelected ? 'ring-2 ring-primary ring-opacity-50' : ''
    }`}>
      <input
        type="checkbox"
        className="checkbox"
        checked={isSelected}
        onChange={() => onSelect(file.id)}
      />
      
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {file.mime_type.startsWith('image/') ? (
          <img
            src={file.url}
            alt={file.alt_text || file.original_name}
            className="w-10 h-10 object-cover rounded"
          />
        ) : (
          <FileIcon mimeType={file.mime_type} extension={file.file_extension} className="w-10 h-10" />
        )}
        
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-base-content truncate" title={file.original_name}>
            {file.original_name}
          </h3>
          <p className="text-sm text-base-content/60">
            {formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <FileItemActions 
        fileId={file.id}
        fileName={file.original_name}
        onDownload={onDownload}
        onDelete={onDelete}
      />
    </div>
  );
}