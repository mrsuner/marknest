export interface MediaFile {
  id: string;
  original_name: string;
  filename: string;
  mime_type: string;
  file_extension: string;
  size: number;
  url: string;
  alt_text?: string;
  description?: string;
  is_public: boolean;
  download_count: number;
  last_accessed_at: string;
  created_at: string;
  updated_at: string;
}

export interface FilesResponse {
  success: boolean;
  data: MediaFile[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  limits?: {
    upload_size_limit: number;
    upload_size_limit_formatted: string;
  };
}

export interface UploadResponseItem {
  success: boolean;
  file?: MediaFile;
  message?: string;
  original_name?: string;
  existing_file?: MediaFile;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: UploadResponseItem[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  limits?: {
    upload_size_limit: number;
    upload_size_limit_formatted: string;
  };
  errors?: Record<string, string | string[]>;
}

export interface FileFilters {
  type?: 'images' | 'documents';
  search?: string;
  public?: boolean;
  sort_by?: 'original_name' | 'size' | 'created_at' | 'last_accessed_at' | 'download_count';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface UploadMetadata {
  alt_text?: string[];
  description?: string[];
  is_public?: boolean[];
}

export type ViewMode = 'grid' | 'list';

export interface UploadLimits {
  upload_size_limit: number;
  upload_size_limit_formatted: string;
}