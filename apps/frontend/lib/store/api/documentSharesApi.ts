import { api } from './api'

export interface DocumentShare {
  id: string
  document_id: string
  user_id: string
  share_token: string
  short_url: string
  access_level: 'public' | 'password' | 'email_list'
  password?: string | null
  expires_at?: string | null
  max_views?: number | null
  view_count: number
  allow_download: boolean
  allow_copy: boolean
  show_watermark: boolean
  description?: string | null
  allowed_emails?: string[] | null
  access_log?: any[]
  is_active: boolean
  created_at: string
  updated_at: string
  document?: {
    id: string
    title: string
  }
  user?: {
    id: string
    name: string
  }
}

export interface CreateDocumentShareRequest {
  document_id: string
  access_level: 'public' | 'password' | 'email_list'
  password?: string
  expires_at?: string
  max_views?: number
  allow_download: boolean
  allow_copy: boolean
  show_watermark: boolean
  description?: string
  allowed_emails?: string[]
}

export interface UpdateDocumentShareRequest {
  password?: string
  expires_at?: string
  max_views?: number
  allow_download?: boolean
  allow_copy?: boolean
  show_watermark?: boolean
  access_level?: 'public' | 'password' | 'email_list'
  allowed_emails?: string[]
  is_active?: boolean
  description?: string
}

export interface DocumentSharesListParams {
  search?: string
  status?: 'active' | 'inactive' | 'expired'
  access_level?: 'public' | 'password' | 'email_list'
  per_page?: number
  page?: number
}

export interface DocumentShareAnalytics {
  total_views: number
  remaining_views?: number | null
  is_expired: boolean
  days_until_expiry?: number | null
  access_log: any[]
  created_at: string
  last_accessed_at?: string | null
}

export interface BulkUpdateRequest {
  share_ids: string[]
  action: 'activate' | 'deactivate' | 'delete'
}

export const documentSharesApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getDocumentShares: builder.query<
      { 
        data: DocumentShare[]
        current_page: number
        last_page: number
        per_page: number
        total: number
      }, 
      DocumentSharesListParams
    >({
      query: (params) => ({
        url: 'document-shares',
        params,
      }),
      providesTags: ['DocumentShare'],
    }),

    getDocumentShare: builder.query<DocumentShare, string>({
      query: (id) => `document-shares/${id}`,
      providesTags: (result, error, id) => [{ type: 'DocumentShare', id }],
    }),

    createDocumentShare: builder.mutation<DocumentShare, CreateDocumentShareRequest>({
      query: (shareData) => ({
        url: 'document-shares',
        method: 'POST',
        body: shareData,
      }),
      invalidatesTags: ['DocumentShare'],
    }),

    updateDocumentShare: builder.mutation<
      DocumentShare, 
      { id: string; data: UpdateDocumentShareRequest }
    >({
      query: ({ id, data }) => ({
        url: `document-shares/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'DocumentShare', id },
        'DocumentShare',
      ],
    }),

    deleteDocumentShare: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `document-shares/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'DocumentShare', id },
        'DocumentShare',
      ],
    }),

    toggleDocumentShare: builder.mutation<DocumentShare, string>({
      query: (id) => ({
        url: `document-shares/${id}/toggle`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'DocumentShare', id },
        'DocumentShare',
      ],
    }),

    getDocumentShareAnalytics: builder.query<DocumentShareAnalytics, string>({
      query: (id) => `document-shares/${id}/analytics`,
      providesTags: (result, error, id) => [{ type: 'DocumentShare', id }],
    }),

    bulkUpdateDocumentShares: builder.mutation<{ message: string }, BulkUpdateRequest>({
      query: (data) => ({
        url: 'document-shares/bulk-update',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DocumentShare'],
    }),

    getPublicDocumentShare: builder.query<
      {
        document: {
          id: string
          title: string
          content: string
          rendered_html?: string
        }
        share_settings: {
          allow_download: boolean
          allow_copy: boolean
          show_watermark: boolean
        }
        owner: {
          name: string
        }
      },
      { shareToken: string; password?: string; email?: string }
    >({
      query: ({ shareToken, password, email }) => ({
        url: `share/${shareToken}`,
        params: { password, email },
      }),
    }),

    findActiveShareByDocument: builder.query<
      {
        share_token: string
        is_active: boolean
        access_level: string
      },
      string
    >({
      query: (documentId) => `documents/${documentId}/active-share`,
    }),
  }),
})

export const {
  useGetDocumentSharesQuery,
  useGetDocumentShareQuery,
  useCreateDocumentShareMutation,
  useUpdateDocumentShareMutation,
  useDeleteDocumentShareMutation,
  useToggleDocumentShareMutation,
  useGetDocumentShareAnalyticsQuery,
  useBulkUpdateDocumentSharesMutation,
  useGetPublicDocumentShareQuery,
  useFindActiveShareByDocumentQuery,
} = documentSharesApi