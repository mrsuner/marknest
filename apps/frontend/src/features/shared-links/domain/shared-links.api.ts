import { baseApi } from '@/lib/store/api/baseApi';

// Re-export the existing API and types for the feature
export {
  documentSharesApi,
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
} from '@/lib/store/api/documentSharesApi';

export type {
  DocumentShare,
  CreateDocumentShareRequest,
  UpdateDocumentShareRequest,
  DocumentSharesListParams,
  DocumentShareAnalytics,
  BulkUpdateRequest,
} from '@/lib/store/api/documentSharesApi';

// Re-export baseApi for consistency
export { baseApi };