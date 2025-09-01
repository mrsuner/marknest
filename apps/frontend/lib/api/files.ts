import { env } from '@/lib/config/env';

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
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: Array<{
    success: boolean;
    file?: MediaFile;
    message?: string;
    original_name?: string;
    existing_file?: MediaFile;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
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

class FilesAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };
  }

  async getFiles(filters: FileFilters = {}): Promise<FilesResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const url = `${env.API_BASE_URL}/api/files${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch files: ${response.statusText}`);
    }

    return response.json();
  }

  async uploadFiles(
    files: File[],
    metadata: {
      alt_text?: string[];
      description?: string[];
      is_public?: boolean[];
    } = {}
  ): Promise<UploadResponse> {
    const formData = new FormData();

    // Add files to FormData
    files.forEach((file) => {
      formData.append('files[]', file);
    });

    // Add metadata arrays
    if (metadata.alt_text) {
      metadata.alt_text.forEach((text, index) => {
        if (text) formData.append(`alt_text[${index}]`, text);
      });
    }

    if (metadata.description) {
      metadata.description.forEach((desc, index) => {
        if (desc) formData.append(`description[${index}]`, desc);
      });
    }

    if (metadata.is_public) {
      metadata.is_public.forEach((isPublic, index) => {
        formData.append(`is_public[${index}]`, isPublic ? '1' : '0');
      });
    }

    const response = await fetch(`${env.API_BASE_URL}/api/files`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteFile(fileId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${env.API_BASE_URL}/api/files/${fileId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }

    return response.json();
  }

  async updateFile(
    fileId: string,
    updates: {
      alt_text?: string;
      description?: string;
      is_public?: boolean;
    }
  ): Promise<{ success: boolean; file: MediaFile }> {
    const response = await fetch(`${env.API_BASE_URL}/api/files/${fileId}`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update file: ${response.statusText}`);
    }

    return response.json();
  }

  async downloadFile(fileId: string): Promise<void> {
    const response = await fetch(`${env.API_BASE_URL}/api/files/${fileId}/download`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : 'download';

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const filesAPI = new FilesAPI();