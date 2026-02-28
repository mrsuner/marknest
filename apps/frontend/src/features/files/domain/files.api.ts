import { baseApi } from '@/lib/store/api/baseApi';
import { MediaFile, FilesResponse, UploadResponse, FileFilters, UploadMetadata } from './files.types';

export const filesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFiles: builder.query<FilesResponse, FileFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
        const queryString = params.toString();
        return `files${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Files'],
    }),

    uploadFiles: builder.mutation<UploadResponse, { files: File[]; metadata?: UploadMetadata }>({
      query: ({ files, metadata = {} }) => {
        const formData = new FormData();

        files.forEach((file) => {
          formData.append('files[]', file);
        });

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

        return {
          url: 'files',
          method: 'POST',
          body: formData,
          prepareHeaders: (headers: Headers) => {
            // Remove content-type header to let browser set it with boundary
            headers.delete('content-type');
            return headers;
          },
        };
      },
      invalidatesTags: ['Files'],
    }),

    deleteFile: builder.mutation<{ success: boolean; message: string }, string>({
      query: (fileId) => ({
        url: `files/${fileId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Files'],
    }),

    updateFile: builder.mutation<
      { success: boolean; file: MediaFile },
      { fileId: string; updates: { alt_text?: string; description?: string; is_public?: boolean } }
    >({
      query: ({ fileId, updates }) => ({
        url: `files/${fileId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Files'],
    }),

    downloadFile: builder.mutation<Blob, string>({
      query: (fileId) => ({
        url: `files/${fileId}/download`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetFilesQuery,
  useUploadFilesMutation,
  useDeleteFileMutation,
  useUpdateFileMutation,
  useDownloadFileMutation,
} = filesApi;