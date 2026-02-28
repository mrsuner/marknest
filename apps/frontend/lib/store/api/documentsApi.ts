import { api, Document } from './api'

export interface CreateDocumentRequest {
  title: string
  content?: string
  folder_id?: string | null
  tags?: string[]
  status?: string
}

export interface UpdateDocumentRequest {
  title?: string
  content?: string
  folder_id?: string | null
  tags?: string[]
  status?: string
  is_auto_save?: boolean
  change_summary?: string
}

export interface MoveDocumentRequest {
  folder_id?: string | null
}

export interface DocumentStats {
  word_count: number
  character_count: number
  reading_time: number
  view_count: number
  last_accessed: string
  collaboration_count: number
  version_count: number
  size: number
}

export interface DocumentVersion {
  id: string
  document_id?: string
  version_number: number
  title: string
  content?: string
  rendered_html?: string
  word_count: number
  character_count: number
  size?: number
  change_summary: string
  operation: 'create' | 'update' | 'restore'
  is_auto_save: boolean
  diff?: any
  created_at: string
  user: {
    id: string
    name: string
    email: string
  } | null
}

export interface DocumentVersionsResponse {
  data: DocumentVersion[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface DocumentVersionResponse {
  data: DocumentVersion
}

export interface RestoreVersionResponse {
  data: {
    id: string
    title: string
    version_number: number
    message: string
  }
}

export const documentsApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getDocuments: builder.query<{ data: Document[]; message: string }, { folder_id?: string; status?: string; favorites?: boolean; archived?: boolean; page?: number; limit?: number; sort?: string; order?: 'asc' | 'desc' }>({
      query: (params) => ({
        url: 'documents',
        params,
      }),
      providesTags: ['Document'],
    }),
    
    getDocument: builder.query<{ data: Document; message: string }, string>({
      query: (id) => `documents/${id}`,
      providesTags: (result, error, id) => [{ type: 'Document', id }],
    }),
    
    createDocument: builder.mutation<{ data: Document; message: string }, CreateDocumentRequest>({
      query: (document) => ({
        url: 'documents',
        method: 'POST',
        body: document,
      }),
      invalidatesTags: ['Document', 'FolderContents'],
    }),
    
    updateDocument: builder.mutation<{ data: Document; message: string }, { id: string; data: UpdateDocumentRequest }>({
      query: ({ id, data }) => ({
        url: `documents/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Document', id },
        'FolderContents',
      ],
    }),
    
    deleteDocument: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Document', id },
        'Document',
        'FolderContents',
      ],
    }),
    
    duplicateDocument: builder.mutation<{ data: Document; message: string }, string>({
      query: (id) => ({
        url: `documents/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['Document', 'FolderContents'],
    }),
    
    toggleFavorite: builder.mutation<{ data: Document; message: string }, string>({
      query: (id) => ({
        url: `documents/${id}/toggle-favorite`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Document', id },
        'FolderContents',
      ],
    }),

    bulkToggleFavorite: builder.mutation<
      { data: { updated_count: number; is_favorite: boolean; document_ids: string[] }; message: string },
      { document_ids: string[]; is_favorite: boolean }
    >({
      query: (data) => ({
        url: 'documents/bulk-toggle-favorite',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Document', 'FolderContents'],
    }),
    
    toggleArchive: builder.mutation<{ data: Document; message: string }, string>({
      query: (id) => ({
        url: `documents/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Document', id },
        'FolderContents',
      ],
    }),
    
    restoreDocument: builder.mutation<{ data: Document; message: string }, string>({
      query: (id) => ({
        url: `documents/${id}/restore`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Document', id },
        'Document',
        'FolderContents',
      ],
    }),
    
    moveDocument: builder.mutation<{ data: Document; message: string }, { id: string; data: MoveDocumentRequest }>({
      query: ({ id, data }) => ({
        url: `documents/${id}/move`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Document', id },
        'FolderContents',
      ],
    }),
    
    getDocumentStats: builder.query<{ data: DocumentStats; message: string }, string>({
      query: (id) => `documents/${id}/stats`,
      providesTags: (result, error, id) => [{ type: 'Document', id }],
    }),
    
    getFavorites: builder.query<{ data: Document[]; message: string }, void>({
      query: () => 'collections/favorites',
      providesTags: ['Document'],
    }),
    
    getArchived: builder.query<{ data: Document[]; message: string }, void>({
      query: () => 'collections/archived',
      providesTags: ['Document'],
    }),
    
    getRecent: builder.query<{ 
      data: Document[]; 
      meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
      };
      links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
      };
    }, { 
      page?: number; 
      per_page?: number; 
      search?: string; 
      sort_by?: 'updated_at' | 'title' | 'word_count' | 'created_at';
      sort_direction?: 'asc' | 'desc';
    }>({
      query: (params) => ({
        url: 'collections/recent',
        params,
      }),
      providesTags: ['Document'],
    }),
    
    getTrashed: builder.query<{ 
      data: any[]; // Trashed documents have additional fields like deleted_at and days_until_permanent_deletion
      meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number | null;
        to?: number | null;
      };
    }, { 
      page?: number; 
      per_page?: number; 
    }>({
      query: (params) => ({
        url: 'collections/trash',
        params,
      }),
      providesTags: ['Document'],
    }),
    
    forceDeleteDocument: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `documents/${id}/force`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Document', 'FolderContents'],
    }),
    
    globalSearch: builder.query<{ data: Document[]; message: string }, { query: string; filters?: object }>({
      query: ({ query, filters }) => ({
        url: 'search',
        params: { query, ...filters },
      }),
      providesTags: ['Document'],
    }),
    
    // Version management endpoints
    getDocumentVersions: builder.query<DocumentVersionsResponse, { documentId: string; page?: number; perPage?: number }>({
      query: ({ documentId, page = 1, perPage = 10 }) => ({
        url: `documents/${documentId}/versions`,
        params: { page, per_page: perPage },
      }),
      providesTags: (_result, _error, { documentId }) => [{ type: 'DocumentVersion', id: documentId }],
    }),
    
    getDocumentVersion: builder.query<DocumentVersionResponse, { documentId: string; versionId: string }>({
      query: ({ documentId, versionId }) => `documents/${documentId}/versions/${versionId}`,
      providesTags: (_result, _error, { documentId, versionId }) => [
        { type: 'DocumentVersion', id: `${documentId}-${versionId}` }
      ],
    }),
    
    restoreDocumentVersion: builder.mutation<RestoreVersionResponse, { documentId: string; versionId: string; changeSummary?: string }>({
      query: ({ documentId, versionId, changeSummary }) => ({
        url: `documents/${documentId}/versions/${versionId}/restore`,
        method: 'POST',
        body: changeSummary ? { change_summary: changeSummary } : {},
      }),
      invalidatesTags: (_result, _error, { documentId }) => [
        { type: 'Document', id: documentId },
        { type: 'DocumentVersion', id: documentId },
        'Document',
      ],
    }),
  }),
})

export const {
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useDuplicateDocumentMutation,
  useToggleFavoriteMutation,
  useBulkToggleFavoriteMutation,
  useToggleArchiveMutation,
  useRestoreDocumentMutation,
  useMoveDocumentMutation,
  useGetDocumentStatsQuery,
  useGetFavoritesQuery,
  useGetArchivedQuery,
  useGetRecentQuery,
  useGetTrashedQuery,
  useForceDeleteDocumentMutation,
  useGlobalSearchQuery,
  useLazyGlobalSearchQuery,
  // Version management hooks
  useGetDocumentVersionsQuery,
  useGetDocumentVersionQuery,
  useRestoreDocumentVersionMutation,
} = documentsApi