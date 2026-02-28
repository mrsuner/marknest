export type { DocumentShare } from '@/lib/store/api/documentSharesApi';

export interface EditShareFormData {
  password?: string;
  expires_at?: string;
  max_views?: number;
  allow_download: boolean;
  allow_copy: boolean;
  show_watermark: boolean;
  access_level: string;
  allowed_emails?: string[];
  description?: string;
  is_active: boolean;
}

export interface SharesApiResponse {
  data: import('@/lib/store/api/documentSharesApi').DocumentShare[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface SharesQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  access_level?: string;
}

export interface BulkActionRequest {
  share_ids: string[];
  action: 'activate' | 'deactivate' | 'delete';
}
