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

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery,
  tagTypes: ['Folder', 'Document', 'FolderContents', 'UserPreferences', 'DocumentShare', 'Files'],
  endpoints: () => ({}),
})