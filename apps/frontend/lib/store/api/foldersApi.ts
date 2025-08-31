import { api, Document } from './api'

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

export interface UpdateFolderRequest {
  name?: string
  description?: string
  color?: string
  icon?: string
}

export interface MoveFolderRequest {
  parent_id?: string | null
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

export const foldersApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
    
    getFolder: builder.query<{ data: { folder: Folder; breadcrumbs: BreadcrumbItem[] }; message: string }, string>({
      query: (folderId) => `folders/${folderId}`,
      providesTags: (result, error, folderId) => [{ type: 'Folder', id: folderId }],
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
    
    updateFolder: builder.mutation<{ data: Folder; message: string }, { id: string; data: UpdateFolderRequest }>({
      query: ({ id, data }) => ({
        url: `folders/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Folder', id },
        'Folder',
        'FolderContents',
      ],
    }),
    
    moveFolder: builder.mutation<{ data: Folder; message: string }, { id: string; data: MoveFolderRequest }>({
      query: ({ id, data }) => ({
        url: `folders/${id}/move`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Folder', 'FolderContents'],
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
    
    getBreadcrumbs: builder.query<{ data: BreadcrumbItem[]; message: string }, string>({
      query: (folderId) => `folders/${folderId}/breadcrumbs`,
      providesTags: (result, error, folderId) => [{ type: 'Folder', id: folderId }],
    }),
  }),
})

export const {
  useGetFolderTreeQuery,
  useGetFolderContentsQuery,
  useGetFolderQuery,
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useMoveFolderMutation,
  useDeleteFolderMutation,
  useSearchFoldersQuery,
  useLazySearchFoldersQuery,
  useGetBreadcrumbsQuery,
} = foldersApi