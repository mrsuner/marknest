import { baseApi } from './baseApi'

export interface UserPreferences {
  id?: number
  user_id?: number
  theme: string
  editor_theme: string
  editor_font_family: string
  editor_font_size: number
  editor_line_numbers: boolean
  editor_word_wrap: boolean
  editor_auto_save: boolean
  editor_auto_save_interval: number
  preview_sync_scroll: boolean
  preview_style: string
  default_view: string
  enable_vim_mode: boolean
  enable_spell_check: boolean
  language: string
  timezone: string
  email_notifications: boolean
  notification_settings: Record<string, unknown>
  keyboard_shortcuts: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface PreferencesResponse {
  success: boolean
  message?: string
  data: UserPreferences
}

export const preferencesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserPreferences: builder.query<PreferencesResponse, void>({
      query: () => ({
        url: 'user/preferences',
        method: 'GET',
      }),
      providesTags: ['UserPreferences'],
    }),

    updateUserPreferences: builder.mutation<PreferencesResponse, Partial<UserPreferences>>({
      query: (preferences) => ({
        url: 'user/preferences',
        method: 'PUT',
        body: preferences,
      }),
      invalidatesTags: ['UserPreferences'],
    }),

    resetUserPreferences: builder.mutation<PreferencesResponse, void>({
      query: () => ({
        url: 'user/preferences/reset',
        method: 'POST',
      }),
      invalidatesTags: ['UserPreferences'],
    }),
  }),
})

export const {
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
  useResetUserPreferencesMutation,
} = preferencesApi