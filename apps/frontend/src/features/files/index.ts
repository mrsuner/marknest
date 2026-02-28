// Domain exports
export { useFilesManagement } from './domain/files.hooks';
export { filesApi, useGetFilesQuery, useUploadFilesMutation, useDeleteFileMutation, useUpdateFileMutation, useDownloadFileMutation } from './domain/files.api';
export type { MediaFile, ViewMode, FileFilters, UploadLimits, UploadResponseItem } from './domain/files.types';
export { formatFileSize } from './domain/files.utils';

// UI exports
export { FilesDropzone } from './ui/FilesDropzone';
export { FilesHeader } from './ui/FilesHeader';
export { FilesActionsBar } from './ui/FilesActionsBar';
export { FilesGrid } from './ui/FilesGrid';
export { FilesError } from './ui/FilesError';
export { FilesLoading } from './ui/FilesLoading';