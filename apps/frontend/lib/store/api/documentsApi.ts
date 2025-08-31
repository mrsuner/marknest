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
  document_id: string
  version_number: number
  content: string
  change_summary?: string
  created_at: string
  user_id: string
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
        url: `documents/${id}/favorite`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Document', id },
        'FolderContents',
      ],
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
    
    getTrashed: builder.query<{ data: Document[]; message: string }, void>({
      query: () => 'collections/trash',
      providesTags: ['Document'],
    }),
    
    globalSearch: builder.query<{ data: Document[]; message: string }, { query: string; filters?: object }>({
      query: ({ query, filters }) => ({
        url: 'search',
        params: { query, ...filters },
      }),
      providesTags: ['Document'],
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
  useToggleArchiveMutation,
  useRestoreDocumentMutation,
  useMoveDocumentMutation,
  useGetDocumentStatsQuery,
  useGetFavoritesQuery,
  useGetArchivedQuery,
  useGetRecentQuery,
  useGetTrashedQuery,
  useGlobalSearchQuery,
  useLazyGlobalSearchQuery,
} = documentsApi