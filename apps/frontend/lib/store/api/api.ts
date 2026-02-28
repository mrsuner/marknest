import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { env } from '@/lib/config/env'

const baseQuery = fetchBaseQuery({
  baseUrl: `${env.API_BASE_URL}/api`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    headers.set('accept', 'application/json')
    headers.set('content-type', 'application/json')
    return headers
  },
})

// Types
export interface Folder {
  id: string
  name: string
  description?: string
  user_id: string
  parent_id: string | null
  path: string
  depth: number
  order: number
  color?: string
  icon?: string
  created_at: string
  updated_at: string
  documents_count?: number
}

export interface Document {
  id: string
  title: string
  slug: string
  content: string
  rendered_html?: string
  user_id: string
  folder_id: string | null
  folder_name?: string
  folder_path?: string
  size: number
  word_count: number
  character_count: number
  version_number: number
  is_favorite: boolean
  is_archived: boolean
  tags?: string[]
  metadata?: any
  status: string
  created_at: string
  updated_at: string
  last_accessed_at?: string
}

export interface FolderContentsItem {
  id: string
  name: string
  type: 'folder' | 'document'
  modified: string
  size?: string
  documentCount?: number
  color?: string
  icon?: string
  shared?: boolean
  favorite?: boolean
}

export interface BreadcrumbItem {
  id: string
  name: string
  path: string
}

export interface FolderContentsResponse {
  data: {
    items: FolderContentsItem[]
    breadcrumbs: BreadcrumbItem[]
    currentFolder: Folder | null
  }
  message: string
}

export interface CreateFolderRequest {
  name: string
  parent_id?: string | null
  description?: string
  color?: string
  icon?: string
}

export interface CreateDocumentRequest {
  title: string
  content?: string
  folder_id?: string | null
  tags?: string[]
  status?: string
}

export interface SearchRequest {
  query: string
  type?: 'all' | 'folders' | 'documents'
}

export interface SearchResponse {
  data: Array<{
    id: string
    name: string
    type: 'folder' | 'document'
    path?: string
    folder_id?: string
    size?: string
    modified: string
  }>
  message: string
}

export interface User {
  id: string
  name: string
  email: string
  plan: 'free' | 'pro' | 'enterprise'
  storage_used: number
  storage_limit: number
  document_count: number
  document_limit: number
  links_count: number
  links_limit: number
  version_history_days: number
  can_share_public: boolean
  can_password_protect: boolean
  has_password: boolean
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Folder', 'Document', 'FolderContents', 'User', 'DocumentShare', 'DocumentVersion'],
  endpoints: (builder) => ({
    // User endpoints
    getMe: builder.query<User, void>({
      query: () => 'me',
      providesTags: ['User'],
    }),

    // Folder endpoints
    getFolderTree: builder.query<{ data: Folder[]; message: string }, void>({
      query: () => 'folders',
      providesTags: ['Folder'],
    }),
    
    getFolderContents: builder.query<FolderContentsResponse, string | null>({
      query: (folderId) => {
        if (folderId) {
          return `folders/${folderId}/contents`
        }
        return 'folders/contents'
      },
      providesTags: (result, error, folderId) => [
        { type: 'FolderContents', id: folderId || 'root' },
        'Folder',
        'Document',
      ],
    }),
    
    createFolder: builder.mutation<{ data: Folder; message: string }, CreateFolderRequest>({
      query: (folder) => ({
        url: 'folders',
        method: 'POST',
        body: folder,
      }),
      invalidatesTags: (result, error, { parent_id }) => [
        'Folder',
        { type: 'FolderContents', id: parent_id || 'root' },
      ],
    }),
    
    deleteFolder: builder.mutation<{ message: string }, { id: string; action?: 'abort' | 'move_to_parent' | 'delete_all' }>({
      query: ({ id, action }) => ({
        url: `folders/${id}${action ? `?action=${action}` : ''}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Folder', 'FolderContents'],
    }),
    
    searchFolders: builder.query<SearchResponse, SearchRequest>({
      query: ({ query, type = 'all' }) => ({
        url: 'folders/search',
        params: { query, type },
      }),
      providesTags: ['Folder', 'Document'],
    }),

    // Document endpoints
    createDocument: builder.mutation<{ data: Document; message: string }, CreateDocumentRequest>({
      query: (document) => ({
        url: 'documents',
        method: 'POST',
        body: document,
      }),
      invalidatesTags: ['Document', 'FolderContents'],
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
  }),
})

export const {
  useGetMeQuery,
  useGetFolderTreeQuery,
  useGetFolderContentsQuery,
  useCreateFolderMutation,
  useDeleteFolderMutation,
  useSearchFoldersQuery,
  useLazySearchFoldersQuery,
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
} = api