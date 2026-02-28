"use client";

import { useState, useEffect } from 'react';
import { useUpdateDocumentShareMutation } from '../domain';
import type { DocumentShare, UpdateDocumentShareRequest } from '../domain';

interface EditShareFormData {
  password?: string;
  expires_at?: string;
  max_views?: number | undefined;
  allow_download: boolean;
  allow_copy: boolean;
  show_watermark: boolean;
  access_level: string;
  allowed_emails?: string[];
  description?: string;
  is_active: boolean;
}

interface EditShareModalProps {
  share: DocumentShare | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditShareModal({ share, isOpen, onClose }: EditShareModalProps) {
  const [formData, setFormData] = useState<EditShareFormData | null>(null);
  const [updateShare, { isLoading }] = useUpdateDocumentShareMutation();

  useEffect(() => {
    if (share) {
      setFormData({
        password: '',
        expires_at: share.expires_at || '',
        max_views: share.max_views ?? undefined,
        allow_download: share.allow_download,
        allow_copy: share.allow_copy,
        show_watermark: share.show_watermark,
        access_level: share.access_level,
        allowed_emails: share.allowed_emails || [],
        description: share.description || '',
        is_active: share.is_active,
      });
    }
  }, [share]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!share || !formData) return;

    try {
      const payload: UpdateDocumentShareRequest = {};
      
      if (formData.password && formData.password.trim()) {
        payload.password = formData.password;
      }
      
      if (formData.expires_at !== (share.expires_at || '')) {
        payload.expires_at = formData.expires_at || undefined;
      }
      
      if (formData.max_views !== share.max_views) {
        payload.max_views = formData.max_views || undefined;
      }
      
      if (formData.allow_download !== share.allow_download) {
        payload.allow_download = formData.allow_download;
      }
      
      if (formData.allow_copy !== share.allow_copy) {
        payload.allow_copy = formData.allow_copy;
      }
      
      if (formData.show_watermark !== share.show_watermark) {
        payload.show_watermark = formData.show_watermark;
      }
      
      if (formData.access_level !== share.access_level) {
        payload.access_level = formData.access_level as 'public' | 'password' | 'email_list';
      }
      
      if (JSON.stringify(formData.allowed_emails || []) !== JSON.stringify(share.allowed_emails || [])) {
        payload.allowed_emails = formData.allowed_emails;
      }
      
      if (formData.description !== (share.description || '')) {
        payload.description = formData.description;
      }
      
      if (formData.is_active !== share.is_active) {
        payload.is_active = formData.is_active;
      }

      await updateShare({ id: share.id, data: payload }).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to update share:', error);
    }
  };

  const addEmailToList = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      allowed_emails: [...(formData.allowed_emails || []), '']
    });
  };

  const removeEmailFromList = (index: number) => {
    if (!formData) return;
    const newEmails = [...(formData.allowed_emails || [])];
    newEmails.splice(index, 1);
    setFormData({
      ...formData,
      allowed_emails: newEmails
    });
  };

  const updateEmailInList = (index: number, email: string) => {
    if (!formData) return;
    const newEmails = [...(formData.allowed_emails || [])];
    newEmails[index] = email;
    setFormData({
      ...formData,
      allowed_emails: newEmails
    });
  };

  if (!isOpen || !share || !formData) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <form className="h-full flex flex-col" onSubmit={handleSubmit}>
          {/* Header */}
          <div className="sticky top-0 bg-base-100 px-6 py-4 border-b border-base-300 z-10">
            <h3 className="font-bold text-xl text-base-content">
              Edit Share
            </h3>
            <p className="text-base-content/60 text-sm mt-1">
              Modify settings for &ldquo;<span className="font-medium">{share.document?.title}</span>&rdquo;
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Main Settings */}
            <div className="space-y-8">
              {/* Access Settings */}
              <div className="card bg-base-50 border border-base-200">
                <div className="card-body p-6">
                  <h4 className="font-semibold text-lg mb-6">Access Settings</h4>
                  
                  {/* Access Level */}
                  <div className="form-control mb-6">
                    <label className="label pb-3">
                      <span className="label-text font-medium text-base">Access Level</span>
                    </label>
                    <select 
                      className="select select-bordered select-lg"
                      value={formData.access_level}
                      onChange={(e) => setFormData({ ...formData, access_level: e.target.value })}
                    >
                      <option value="public">🌐 Public - Anyone with the link</option>
                      <option value="password">🔒 Password Protected</option>
                      <option value="email_list">📧 Specific Email List</option>
                    </select>
                  </div>

                  {/* Conditional Fields */}
                  {formData.access_level === 'password' && (
                    <div className="form-control">
                      <label className="label pb-3">
                        <span className="label-text font-medium text-base">Password</span>
                        <span className="label-text-alt text-base-content/60">Leave empty to keep current</span>
                      </label>
                      <input
                        type="password"
                        className="input input-bordered input-lg"
                        placeholder="Enter new password to change"
                        value={formData.password || ''}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  )}

                  {formData.access_level === 'email_list' && (
                    <div className="form-control">
                      <label className="label pb-3">
                        <span className="label-text font-medium text-base">Allowed Emails</span>
                      </label>
                      <div className="space-y-3">
                        {(formData.allowed_emails || []).map((email, index) => (
                          <div key={index} className="flex gap-3">
                            <input
                              type="email"
                              className="input input-bordered input-lg flex-1"
                              value={email}
                              onChange={(e) => updateEmailInList(index, e.target.value)}
                              placeholder="Enter email address"
                            />
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm text-error"
                              onClick={() => removeEmailFromList(index)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={addEmailToList}
                        >
                          + Add Email
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Time & View Limits */}
              <div className="card bg-base-50 border border-base-200">
                <div className="card-body p-6">
                  <h4 className="font-semibold text-lg mb-6">Limits & Expiration</h4>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div className="form-control">
                      <label className="label pb-3">
                        <span className="label-text font-medium text-base">Expires At</span>
                        <span className="label-text-alt text-base-content/60">Optional</span>
                      </label>
                      <input
                        type="datetime-local"
                        className="input input-bordered input-lg"
                        value={formData.expires_at ? new Date(formData.expires_at).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                      />
                      <label className="label pt-2">
                        <span className="label-text-alt text-base-content/50">Leave empty for no expiration</span>
                      </label>
                    </div>

                    <div className="form-control">
                      <label className="label pb-3">
                        <span className="label-text font-medium text-base">Max Views</span>
                        <span className="label-text-alt text-base-content/60">Optional</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered input-lg"
                        min="1"
                        max="10000"
                        placeholder="No limit"
                        value={formData.max_views || ''}
                        onChange={(e) => setFormData({ ...formData, max_views: e.target.value ? parseInt(e.target.value) : undefined })}
                      />
                      <label className="label pt-2">
                        <span className="label-text-alt text-base-content/50">Maximum number of views</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="card bg-base-50 border border-base-200">
                <div className="card-body p-6">
                  <h4 className="font-semibold text-lg mb-6">Description</h4>
                  <div className="form-control">
                    <label className="label pb-3">
                      <span className="label-text font-medium text-base">Optional Description</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered textarea-lg min-h-[100px]"
                      placeholder="Add a description to help others understand what you're sharing..."
                      rows={4}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Permissions & Status */}
            <div className="space-y-8">
              {/* Permissions */}
              <div className="card bg-base-50 border border-base-200">
                <div className="card-body p-6">
                  <h4 className="font-semibold text-lg mb-6">Permissions</h4>
                  <div className="space-y-6">
                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-4 py-4">
                        <input 
                          type="checkbox" 
                          className="checkbox checkbox-primary checkbox-lg" 
                          checked={formData.allow_download}
                          onChange={(e) => setFormData({ ...formData, allow_download: e.target.checked })}
                        />
                        <div className="flex flex-col">
                          <span className="label-text font-medium text-base">Allow Download</span>
                          <span className="label-text-alt text-base-content/60">Users can download the document</span>
                        </div>
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-4 py-4">
                        <input 
                          type="checkbox" 
                          className="checkbox checkbox-primary checkbox-lg" 
                          checked={formData.allow_copy}
                          onChange={(e) => setFormData({ ...formData, allow_copy: e.target.checked })}
                        />
                        <div className="flex flex-col">
                          <span className="label-text font-medium text-base">Allow Copy</span>
                          <span className="label-text-alt text-base-content/60">Users can copy text content</span>
                        </div>
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-4 py-4">
                        <input 
                          type="checkbox" 
                          className="checkbox checkbox-primary checkbox-lg" 
                          checked={formData.show_watermark}
                          onChange={(e) => setFormData({ ...formData, show_watermark: e.target.checked })}
                        />
                        <div className="flex flex-col">
                          <span className="label-text font-medium text-base">Show Watermark</span>
                          <span className="label-text-alt text-base-content/60">Add watermark to document</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="card bg-base-50 border border-base-200">
                <div className="card-body p-6">
                  <h4 className="font-semibold text-lg mb-6">Share Status</h4>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-4 py-4">
                      <input
                        type="checkbox"
                        className="toggle toggle-success toggle-lg"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      />
                      <div className="flex flex-col">
                        <span className="label-text font-medium text-base">{formData.is_active ? 'Active' : 'Inactive'}</span>
                        <span className="label-text-alt text-base-content/60">
                          {formData.is_active ? 'Share is publicly accessible' : 'Share is disabled'}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className={`alert ${formData.is_active ? 'alert-success' : 'alert-warning'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <div className="font-medium">{formData.is_active ? 'Active' : 'Inactive'}</div>
                  <div className="text-sm opacity-75 mt-1">
                    {formData.is_active ? 'Share is publicly accessible' : 'Share is currently disabled'}
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-base-100 px-6 py-6 border-t border-base-300 z-10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="text-sm text-base-content/60 text-center sm:text-left">
                Changes will be applied immediately
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  type="button"
                  className="btn btn-ghost btn-lg flex-1 sm:flex-none"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg px-8 flex-1 sm:flex-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>close</button>
      </form>
    </div>
  );
}