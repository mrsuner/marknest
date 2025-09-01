'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { env } from '@/lib/config/env';

interface DocumentData {
  id: string;
  title: string;
  content: string;
  rendered_html: string;
}

interface ShareSettings {
  allow_download: boolean;
  allow_copy: boolean;
  show_watermark: boolean;
}

interface Owner {
  name: string;
}

interface PublicDocumentResponse {
  document: DocumentData;
  share_settings: ShareSettings;
  owner: Owner;
}

export default function PublicDocumentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [shareSettings, setShareSettings] = useState<ShareSettings | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const token = params.token as string;
  const urlPassword = searchParams.get('password');

  const fetchDocument = async (passwordAttempt?: string) => {
    try {
      setLoading(true);
      setPasswordError(null);

      const url = new URL(`${env.API_BASE_URL}/api/share/${token}`);
      if (passwordAttempt || urlPassword) {
        url.searchParams.set('password', passwordAttempt || urlPassword || '');
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        setPasswordRequired(true);
        setShowPasswordForm(true);
        setLoading(false);
        return;
      }

      if (response.status === 403) {
        setPasswordError('Invalid password');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to load document');
      }

      const data: PublicDocumentResponse = await response.json();
      setDocument(data.document);
      setShareSettings(data.share_settings);
      setOwner(data.owner);
      setError(null);
      setPasswordRequired(false);
      setShowPasswordForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDocument();
    }
  }, [token, urlPassword]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      fetchDocument(password);
    }
  };

  const copyToClipboard = async () => {
    if (!document?.content) return;

    try {
      await navigator.clipboard.writeText(document.content);
      // TODO: Add toast notification
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadDocument = () => {
    if (!document?.content) return;

    const blob = new Blob([document.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-base-content/60">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100 flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl w-full max-w-md">
          <div className="card-body text-center">
            <div className="text-error mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="card-title justify-center text-error">Error</h2>
            <p className="text-base-content/60 mb-4">{error}</p>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => fetchDocument()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showPasswordForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100 flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl w-full max-w-md">
          <div className="card-body">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="card-title justify-center">Password Protected</h2>
              <p className="text-base-content/60 mt-2">This document requires a password to access.</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter password"
                  className={`input input-bordered w-full ${passwordError ? 'input-error' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {passwordError && (
                  <p className="text-error text-sm mt-1">{passwordError}</p>
                )}
              </div>
              <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={!password.trim()}
              >
                Access Document
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100 flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl w-full max-w-md">
          <div className="card-body text-center">
            <div className="text-base-content/40 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="card-title justify-center">Document Not Found</h2>
            <p className="text-base-content/60">The requested document could not be found or may have been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100">
      {shareSettings?.show_watermark && (
        <div 
          className="fixed inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
              <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
                <text x="100" y="50" text-anchor="middle" dominant-baseline="middle" 
                      font-family="system-ui, -apple-system, sans-serif" 
                      font-size="14" font-weight="bold" 
                      fill="#64748b" opacity="0.08" 
                      transform="rotate(45 100 50)">
                  SHARED BY ${owner?.name?.toUpperCase() || 'USER'}
                </text>
              </svg>
            `)}")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 100px'
          }}
        />
      )}

      <div className="container mx-auto px-6 py-8 max-w-4xl relative z-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-base-content mb-2">{document.title}</h1>
            <p className="text-base-content/60">Shared by {owner?.name}</p>
          </div>
          
          <div className="flex gap-2">
            {shareSettings?.allow_copy && (
              <button
                onClick={copyToClipboard}
                className="btn btn-outline btn-sm"
                title="Copy content"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            )}
            {shareSettings?.allow_download && (
              <button
                onClick={downloadDocument}
                className="btn btn-primary btn-sm"
                title="Download document"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
            )}
          </div>
        </div>

        {/* Document Content */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {document.rendered_html ? (
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: document.rendered_html }}
                style={{
                  userSelect: shareSettings?.allow_copy ? 'text' : 'none',
                  WebkitUserSelect: shareSettings?.allow_copy ? 'text' : 'none',
                  MozUserSelect: shareSettings?.allow_copy ? 'text' : 'none',
                  msUserSelect: shareSettings?.allow_copy ? 'text' : 'none'
                }}
              />
            ) : (
              <pre 
                className="whitespace-pre-wrap text-base-content font-mono text-sm leading-relaxed"
                style={{
                  userSelect: shareSettings?.allow_copy ? 'text' : 'none',
                  WebkitUserSelect: shareSettings?.allow_copy ? 'text' : 'none',
                  MozUserSelect: shareSettings?.allow_copy ? 'text' : 'none',
                  msUserSelect: shareSettings?.allow_copy ? 'text' : 'none'
                }}
              >
                {document.content}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-base-content/40 text-sm">
            Powered by <span className="font-semibold">Marknest</span>
          </p>
        </div>
      </div>
    </div>
  );
}