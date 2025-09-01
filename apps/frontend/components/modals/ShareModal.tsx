'use client';

import { useState } from 'react';
import { useCreateDocumentShareMutation, type CreateDocumentShareRequest, type DocumentShare } from '@/lib/store/api/documentSharesApi';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
  onShareCreated?: (shareData: DocumentShare) => void;
}

interface ShareFormData {
  access_level: 'public' | 'password' | 'email_list';
  password?: string;
  expires_at?: string;
  max_views?: number;
  allow_download: boolean;
  allow_copy: boolean;
  show_watermark: boolean;
  description?: string;
  allowed_emails?: string[];
}

export default function ShareModal({ 
  isOpen, 
  onClose, 
  documentId, 
  documentName,
  onShareCreated 
}: ShareModalProps) {
  const [formData, setFormData] = useState<ShareFormData>({
    access_level: 'public',
    password: '',
    expires_at: '',
    max_views: undefined,
    allow_download: true,
    allow_copy: true,
    show_watermark: false,
    description: '',
    allowed_emails: [],
  });
  
  const [createDocumentShare, { isLoading }] = useCreateDocumentShareMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare payload matching backend validation
      const payload: CreateDocumentShareRequest = {
        document_id: documentId,
        access_level: formData.access_level,
        password: formData.password || undefined,
        expires_at: formData.expires_at || undefined,
        max_views: formData.max_views || undefined,
        allow_download: formData.allow_download,
        allow_copy: formData.allow_copy,
        show_watermark: formData.show_watermark,
        description: formData.description || undefined,
        allowed_emails: formData.allowed_emails?.length ? formData.allowed_emails : undefined,
      };

      const shareData = await createDocumentShare(payload).unwrap();
      onShareCreated?.(shareData);
      onClose();
    } catch (error: any) {
      console.error('Failed to create share:', error);
      // TODO: Show error toast/notification to user
      const message = error?.data?.message || error?.message || 'Failed to create share';
      alert(message);
    }
  };

  const addEmailToList = () => {
    setFormData({
      ...formData,
      allowed_emails: [...(formData.allowed_emails || []), '']
    });
  };

  const removeEmailFromList = (index: number) => {
    const newEmails = [...(formData.allowed_emails || [])];
    newEmails.splice(index, 1);
    setFormData({
      ...formData,
      allowed_emails: newEmails
    });
  };

  const updateEmailInList = (index: number, email: string) => {
    const newEmails = [...(formData.allowed_emails || [])];
    newEmails[index] = email;
    setFormData({
      ...formData,
      allowed_emails: newEmails
    });
  };

  const handlePresetClick = (preset: 'public' | 'private' | 'temporary') => {
    switch (preset) {
      case 'public':
        setFormData({
          ...formData,
          access_level: 'public',
          password: '',
          expires_at: '',
          max_views: undefined,
          allow_download: true,
          allow_copy: true,
          show_watermark: false,
        });
        break;
      case 'private':
        setFormData({
          ...formData,
          access_level: 'password',
          password: '',
          allow_download: false,
          allow_copy: false,
          show_watermark: true,
        });
        break;
      case 'temporary':
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setFormData({
          ...formData,
          access_level: 'public',
          expires_at: tomorrow.toISOString().slice(0, 16),
          max_views: 10,
          show_watermark: true,
        });
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <form className="h-full flex flex-col" onSubmit={handleSubmit}>
          {/* Header */}
          <div className="sticky top-0 bg-base-100 px-6 py-4 border-b border-base-300 z-10">
            <h3 className="font-bold text-xl text-base-content">
              Share Document
            </h3>
            <p className="text-base-content/60 text-sm mt-1">
              Create a sharing link for "<span className="font-medium">{documentName}</span>"
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Access Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Access Settings */}
              <div className="card bg-base-50 border border-base-200">
                <div className="card-body p-6">
                  <h4 className="font-semibold text-base mb-4">Access Settings</h4>
                  
                  {/* Access Level */}
                  <div className="form-control mb-4">
                    <label className="label pb-2">
                      <span className="label-text font-medium">Access Level</span>
                    </label>
                    <select 
                      className="select select-bordered"
                      value={formData.access_level}
                      onChange={(e) => setFormData({ ...formData, access_level: e.target.value as 'public' | 'password' | 'email_list' })}
                    >
                      <option value="public">🌐 Public - Anyone with the link</option>
                      <option value="password">🔒 Password Protected</option>
                      <option value="email_list">📧 Specific Email List</option>
                    </select>
                  </div>

                  {/* Conditional Fields */}
                  {formData.access_level === 'password' && (
                    <div className="form-control">
                      <label className="label pb-2">
                        <span className="label-text font-medium">Password</span>
                        <span className="label-text-alt text-error">*Required</span>
                      </label>
                      <input
                        type="password"
                        className="input input-bordered"
                        placeholder="Set password for access"
                        value={formData.password || ''}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={formData.access_level === 'password'}
                      />
                    </div>
                  )}

                  {formData.access_level === 'email_list' && (
                    <div className="form-control">
                      <label className="label pb-2">
                        <span className="label-text font-medium">Allowed Emails</span>
                      </label>
                      <div className="space-y-2">
                        {(formData.allowed_emails || []).map((email, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="email"
                              className="input input-bordered flex-1"
                              value={email}
                              onChange={(e) => updateEmailInList(index, e.target.value)}
                              placeholder="Enter email address"
                              required
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
                          className="btn btn-ghost btn-sm"
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
                  <h4 className="font-semibold text-base mb-4">Limits & Expiration</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label pb-2">
                        <span className="label-text font-medium">Expires At</span>
                        <span className="label-text-alt text-base-content/60">Optional</span>
                      </label>
                      <input
                        type="datetime-local"
                        className="input input-bordered"
                        value={formData.expires_at ? new Date(formData.expires_at).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                      />
                      <label className="label pt-1">
                        <span className="label-text-alt text-base-content/50">Leave empty for no expiration</span>
                      </label>
                    </div>

                    <div className="form-control">
                      <label className="label pb-2">
                        <span className="label-text font-medium">Max Views</span>
                        <span className="label-text-alt text-base-content/60">Optional</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered"
                        min="1"
                        max="10000"
                        placeholder="No limit"
                        value={formData.max_views || ''}
                        onChange={(e) => setFormData({ ...formData, max_views: e.target.value ? parseInt(e.target.value) : undefined })}
                      />
                      <label className="label pt-1">
                        <span className="label-text-alt text-base-content/50">Maximum number of views</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label pb-2">
                  <span className="label-text font-medium">Description</span>
                  <span className="label-text-alt text-base-content/60">Optional</span>
                </label>
                <textarea
                  className="textarea textarea-bordered min-h-[80px]"
                  placeholder="Add a description to help others understand what you're sharing..."
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Right Column - Permissions & Presets */}
            <div className="space-y-6">
              {/* Permissions */}
              <div className="card bg-base-50 border border-base-200">
                <div className="card-body p-6">
                  <h4 className="font-semibold text-base mb-4">Permissions</h4>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-3 py-3">
                        <input 
                          type="checkbox" 
                          className="checkbox checkbox-primary" 
                          checked={formData.allow_download}
                          onChange={(e) => setFormData({ ...formData, allow_download: e.target.checked })}
                        />
                        <div className="flex flex-col">
                          <span className="label-text font-medium">Allow Download</span>
                          <span className="label-text-alt text-base-content/60">Users can download the document</span>
                        </div>
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-3 py-3">
                        <input 
                          type="checkbox" 
                          className="checkbox checkbox-primary" 
                          checked={formData.allow_copy}
                          onChange={(e) => setFormData({ ...formData, allow_copy: e.target.checked })}
                        />
                        <div className="flex flex-col">
                          <span className="label-text font-medium">Allow Copy</span>
                          <span className="label-text-alt text-base-content/60">Users can copy text content</span>
                        </div>
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-3 py-3">
                        <input 
                          type="checkbox" 
                          className="checkbox checkbox-primary" 
                          checked={formData.show_watermark}
                          onChange={(e) => setFormData({ ...formData, show_watermark: e.target.checked })}
                        />
                        <div className="flex flex-col">
                          <span className="label-text font-medium">Show Watermark</span>
                          <span className="label-text-alt text-base-content/60">Add watermark to document</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="card bg-primary/5 border border-primary/20">
                <div className="card-body p-6">
                  <h4 className="font-semibold text-base mb-4">Quick Presets</h4>
                  <div className="space-y-2">
                    <button 
                      type="button" 
                      className="btn btn-outline btn-sm w-full justify-start"
                      onClick={() => handlePresetClick('public')}
                    >
                      🌐 Public Share
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline btn-sm w-full justify-start"
                      onClick={() => handlePresetClick('private')}
                    >
                      🔒 Private Share
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline btn-sm w-full justify-start"
                      onClick={() => handlePresetClick('temporary')}
                    >
                      ⏰ Temporary Share
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="text-sm">
                  <div className="font-medium">Share Link Preview</div>
                  <div className="font-mono text-xs mt-1 opacity-70">
                    marknest.com/share/abc123...
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-base-100 px-6 py-4 border-t border-base-300 z-10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-base-content/60">
                Share will be created and ready to use immediately
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary px-8"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                      </svg>
                      Create Share
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