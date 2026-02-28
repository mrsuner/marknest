export interface DocumentShare {
  id: string;
  document: {
    id: string;
    title: string;
    type?: string;
  };
  share_token: string;
  short_url?: string;
  expires_at?: string;
  max_views?: number;
  view_count: number;
  allow_download: boolean;
  allow_copy: boolean;
  show_watermark: boolean;
  access_level: string;
  is_active: boolean;
  created_at: string;
  allowed_emails?: string[];
  description?: string;
}

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
  data: DocumentShare[];
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