'use client';

import { useState } from 'react';
import { 
  useGetUserPreferencesQuery, 
  useUpdateUserPreferencesMutation,
  useResetUserPreferencesMutation,
  type UserPreferences 
} from '@/lib/store/api/preferencesApi';

export default function PreferencesPage() {
  const { data: preferencesData, isLoading: isLoadingPreferences, error } = useGetUserPreferencesQuery();
  const [updatePreferences, { isLoading: isUpdating }] = useUpdateUserPreferencesMutation();
  const [resetPreferences, { isLoading: isResetting }] = useResetUserPreferencesMutation();
  
  const [localPreferences, setLocalPreferences] = useState<UserPreferences | null>(null);
  const [saved, setSaved] = useState(false);

  // Use local preferences if available, otherwise fallback to API data
  const preferences = localPreferences || preferencesData?.data;

  // Update local preferences when API data loads
  if (preferencesData?.data && !localPreferences) {
    setLocalPreferences(preferencesData.data);
  }

  const handleSave = async () => {
    if (!localPreferences) return;
    
    try {
      await updatePreferences(localPreferences).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const handleReset = async () => {
    try {
      const result = await resetPreferences().unwrap();
      setLocalPreferences(result.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to reset preferences:', error);
    }
  };

  const handleChange = (field: keyof UserPreferences, value: string | number | boolean) => {
    if (!preferences) return;
    
    setLocalPreferences(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  if (isLoadingPreferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-error mb-2">Error Loading Preferences</h2>
          <p className="text-base-content/60">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-base-content">Preferences</h1>
            <p className="text-base-content/70 text-lg">Customize your Marknest experience</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleReset}
              className={`btn btn-lg btn-outline ${isResetting ? 'loading' : ''}`}
              disabled={isResetting || isUpdating}
            >
              {isResetting ? '' : 'Reset to Default'}
            </button>
            <button 
              onClick={handleSave}
              className={`btn btn-lg ${saved ? 'btn-success' : 'btn-primary'} ${isUpdating ? 'loading' : ''} shadow-lg`}
              disabled={isUpdating || isResetting}
            >
              {saved ? '✓ Saved' : isUpdating ? '' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="space-y-10">
          {/* Appearance Section */}
          <div className="card bg-base-100/80 backdrop-blur-sm shadow-xl border border-base-300/50 hover:shadow-2xl transition-shadow duration-300">
            <div className="card-body p-8">
              <h2 className="card-title text-2xl mb-6 text-primary flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
                Appearance
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="form-control space-y-2">
                  <label className="label">
                    <span className="label-text font-semibold text-base">Theme</span>
                  </label>
                  <select 
                    className="select select-bordered select-lg w-full focus:select-primary"
                    value={preferences.theme}
                    onChange={(e) => handleChange('theme', e.target.value)}
                  >
                    <option value="paperlight">Paper Light</option>
                    <option value="paperdark">Paper Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div className="form-control space-y-2">
                  <label className="label">
                    <span className="label-text font-semibold text-base">Language</span>
                  </label>
                  <select 
                    className="select select-bordered select-lg w-full focus:select-primary"
                    value={preferences.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div className="form-control space-y-2">
                  <label className="label">
                    <span className="label-text font-semibold text-base">Timezone</span>
                  </label>
                  <select 
                    className="select select-bordered select-lg w-full focus:select-primary"
                    value={preferences.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>

                <div className="form-control space-y-2">
                  <label className="label">
                    <span className="label-text font-semibold text-base">Default View</span>
                  </label>
                  <select 
                    className="select select-bordered select-lg w-full focus:select-primary"
                    value={preferences.default_view}
                    onChange={(e) => handleChange('default_view', e.target.value)}
                  >
                    <option value="editor">Editor Only</option>
                    <option value="preview">Preview Only</option>
                    <option value="split">Split View</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Editor Section */}
          <div className="card bg-base-100/80 backdrop-blur-sm shadow-xl border border-base-300/50 hover:shadow-2xl transition-shadow duration-300">
            <div className="card-body p-8">
              <h2 className="card-title text-2xl mb-6 text-primary flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Editor
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="form-control space-y-2">
                  <label className="label">
                    <span className="label-text font-semibold text-base">Editor Theme</span>
                  </label>
                  <select 
                    className="select select-bordered select-lg w-full focus:select-primary"
                    value={preferences.editor_theme}
                    onChange={(e) => handleChange('editor_theme', e.target.value)}
                  >
                    <option value="github-light">GitHub Light</option>
                    <option value="github-dark">GitHub Dark</option>
                    <option value="monokai">Monokai</option>
                    <option value="dracula">Dracula</option>
                  </select>
                </div>

                <div className="form-control space-y-2">
                  <label className="label">
                    <span className="label-text font-semibold text-base">Font Family</span>
                  </label>
                  <select 
                    className="select select-bordered select-lg w-full focus:select-primary"
                    value={preferences.editor_font_family}
                    onChange={(e) => handleChange('editor_font_family', e.target.value)}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Source Code Pro">Source Code Pro</option>
                    <option value="Fira Code">Fira Code</option>
                    <option value="Ubuntu Mono">Ubuntu Mono</option>
                  </select>
                </div>

                <div className="form-control space-y-3">
                  <label className="label">
                    <span className="label-text font-semibold text-base">Editor Font Size: <span className="text-primary font-bold">{preferences.editor_font_size}px</span></span>
                  </label>
                  <input 
                    type="range" 
                    min="10" 
                    max="24" 
                    value={preferences.editor_font_size}
                    onChange={(e) => handleChange('editor_font_size', parseInt(e.target.value))}
                    className="range range-primary range-lg" 
                  />
                  <div className="w-full flex justify-between text-sm font-medium text-base-content/70 px-2">
                    <span>10px</span>
                    <span>24px</span>
                  </div>
                </div>

                <div className="form-control space-y-3">
                  <label className="label">
                    <span className="label-text font-semibold text-base">Auto Save Interval: <span className="text-primary font-bold">{preferences.editor_auto_save_interval}s</span></span>
                  </label>
                  <input 
                    type="range" 
                    min="5" 
                    max="300" 
                    step="5"
                    value={preferences.editor_auto_save_interval}
                    onChange={(e) => handleChange('editor_auto_save_interval', parseInt(e.target.value))}
                    className={`range range-primary range-lg ${!preferences.editor_auto_save ? 'opacity-50' : ''}`}
                    disabled={!preferences.editor_auto_save}
                  />
                  <div className="w-full flex justify-between text-sm font-medium text-base-content/70 px-2">
                    <span>5s</span>
                    <span>5min</span>
                  </div>
                </div>
              </div>

              <div className="divider my-8"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="form-control bg-base-200/50 rounded-lg p-4 hover:bg-base-200 transition-colors">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary checkbox-lg"
                      checked={preferences.editor_line_numbers}
                      onChange={(e) => handleChange('editor_line_numbers', e.target.checked)}
                    />
                    <span className="label-text font-medium text-base">Show Line Numbers</span>
                  </label>
                </div>

                <div className="form-control bg-base-200/50 rounded-lg p-4 hover:bg-base-200 transition-colors">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary checkbox-lg"
                      checked={preferences.editor_word_wrap}
                      onChange={(e) => handleChange('editor_word_wrap', e.target.checked)}
                    />
                    <span className="label-text font-medium text-base">Word Wrap</span>
                  </label>
                </div>

                <div className="form-control bg-base-200/50 rounded-lg p-4 hover:bg-base-200 transition-colors">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary checkbox-lg"
                      checked={preferences.editor_auto_save}
                      onChange={(e) => handleChange('editor_auto_save', e.target.checked)}
                    />
                    <span className="label-text font-medium text-base">Auto Save</span>
                  </label>
                </div>

                <div className="form-control bg-base-200/50 rounded-lg p-4 hover:bg-base-200 transition-colors">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary checkbox-lg"
                      checked={preferences.enable_vim_mode}
                      onChange={(e) => handleChange('enable_vim_mode', e.target.checked)}
                    />
                    <span className="label-text font-medium text-base">Enable Vim Mode</span>
                  </label>
                </div>

                <div className="form-control bg-base-200/50 rounded-lg p-4 hover:bg-base-200 transition-colors">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary checkbox-lg"
                      checked={preferences.enable_spell_check}
                      onChange={(e) => handleChange('enable_spell_check', e.target.checked)}
                    />
                    <span className="label-text font-medium text-base">Spell Check</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="card bg-base-100/80 backdrop-blur-sm shadow-xl border border-base-300/50 hover:shadow-2xl transition-shadow duration-300">
            <div className="card-body p-8">
              <h2 className="card-title text-2xl mb-6 text-primary flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="form-control space-y-2">
                  <label className="label">
                    <span className="label-text font-semibold text-base">Preview Style</span>
                  </label>
                  <select 
                    className="select select-bordered select-lg w-full focus:select-primary"
                    value={preferences.preview_style}
                    onChange={(e) => handleChange('preview_style', e.target.value)}
                  >
                    <option value="github">GitHub</option>
                    <option value="minimal">Minimal</option>
                    <option value="academic">Academic</option>
                    <option value="modern">Modern</option>
                  </select>
                </div>

                <div className="form-control bg-base-200/50 rounded-lg p-4 hover:bg-base-200 transition-colors">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary checkbox-lg"
                      checked={preferences.preview_sync_scroll}
                      onChange={(e) => handleChange('preview_sync_scroll', e.target.checked)}
                    />
                    <span className="label-text font-medium text-base">Sync Scroll</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="card bg-base-100/80 backdrop-blur-sm shadow-xl border border-base-300/50 hover:shadow-2xl transition-shadow duration-300">
            <div className="card-body p-8">
              <h2 className="card-title text-2xl mb-6 text-primary flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM5 7h7m0 0v6m0-6l-7 7" />
                </svg>
                Notifications
              </h2>
              
              <div className="form-control bg-base-200/50 rounded-lg p-4 hover:bg-base-200 transition-colors">
                <label className="label cursor-pointer justify-start gap-4">
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-primary checkbox-lg"
                    checked={preferences.email_notifications}
                    onChange={(e) => handleChange('email_notifications', e.target.checked)}
                  />
                  <span className="label-text font-medium text-base">Email Notifications</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}