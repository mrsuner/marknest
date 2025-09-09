import { useDropzone } from 'react-dropzone';
import { UploadLimits } from '../domain/files.types';

interface FilesDropzoneProps {
  onDrop: (files: File[]) => void;
  isUploading: boolean;
  uploadLimits: UploadLimits | null;
}

export function FilesDropzone({ onDrop, isUploading, uploadLimits }: FilesDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: true,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md', '.csv'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-base-300 hover:border-primary/50'
      } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className="p-3 bg-base-200 rounded-full">
          <svg className="w-8 h-8 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-medium text-base-content mb-1">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-base-content/60">
            or <span className="text-primary cursor-pointer hover:underline">browse files</span> to upload
          </p>
          <p className="text-xs text-base-content/40 mt-2">
            Supports images, PDFs, documents and more
            {uploadLimits && (
              <span className="block mt-1">
                Max file size: {uploadLimits.upload_size_limit_formatted}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}