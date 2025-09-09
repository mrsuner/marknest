import { MediaFile } from '../domain/files.types';
import { formatFileSize } from '../domain/files.utils';
import { FileIcon } from './FileIcon';
import { FileItemActions } from './FileItemActions';

interface FileGridItemProps {
  file: MediaFile;
  isSelected: boolean;
  onSelect: (fileId: string) => void;
  onDownload: (fileId: string, fileName: string) => void;
  onDelete: (fileId: string) => void;
}

export function FileGridItem({ file, isSelected, onSelect, onDownload, onDelete }: FileGridItemProps) {
  return (
    <div className={`bg-base-100 rounded-lg border border-base-300 p-4 hover:shadow-lg transition-shadow cursor-pointer ${
      isSelected ? 'ring-2 ring-primary ring-opacity-50' : ''
    }`}>
      <div className="flex items-center justify-between mb-3">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={isSelected}
          onChange={() => onSelect(file.id)}
        />
        <FileItemActions 
          fileId={file.id}
          fileName={file.original_name}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      </div>
      
      <div className="flex flex-col items-center text-center">
        {file.mime_type.startsWith('image/') ? (
          <img
            src={file.url}
            alt={file.alt_text || file.original_name}
            className="w-16 h-16 object-cover rounded-lg mb-3"
          />
        ) : (
          <div className="mb-3">
            <FileIcon mimeType={file.mime_type} extension={file.file_extension} />
          </div>
        )}
        
        <h3 className="font-medium text-sm text-base-content mb-1 truncate w-full" title={file.original_name}>
          {file.original_name}
        </h3>
        <p className="text-xs text-base-content/60">
          {formatFileSize(file.size)}
        </p>
      </div>
    </div>
  );
}