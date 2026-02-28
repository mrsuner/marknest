'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { env } from '@/lib/config/env';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

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
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [changeMessage, setChangeMessage] = useState<string | null>(null);

  const token = params.token as string;
  const urlPassword = searchParams.get('password');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Configure marked for synchronous parsing
  marked.setOptions({
    async: false,
  });

  // Memoized markdown parsing
  const parsedMarkdown = useMemo(() => {
    if (!document?.content || document.rendered_html) {
      return null;
    }
    try {
      return marked(document.content) as string;
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return null;
    }
  }, [document?.content, document?.rendered_html]);

  // Function to highlight code blocks
  const highlightCode = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        window.document.querySelectorAll('pre code').forEach((block) => {
          if (!block.classList.contains('hljs')) {
            hljs.highlightElement(block as HTMLElement);
          }
        });
      }, 100);
    }
  }, []);

  const fetchDocument = useCallback(async (passwordAttempt?: string) => {
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
        setShowPasswordForm(true);
        setLoading(false);
        return;
      }

      if (response.status === 403) {
        setPasswordError('Invalid password');
        setLoading(false);
        return;
      }

      if (response.status === 404) {
        throw new Error('This share link has been deactivated, expired, or does not exist.');
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
      setShowPasswordForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [token, urlPassword]);

  const checkDocumentStatus = useCallback(async () => {
    try {
      const url = new URL(`${env.API_BASE_URL}/api/share/${token}`);
      if (urlPassword) {
        url.searchParams.set('password', urlPassword);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        setError('This share link has been deactivated, expired, or does not exist.');
        setChangeMessage('The document owner has deactivated this share link.');
        setSettingsChanged(true);
        return;
      }

      if (response.status === 401 || response.status === 403) {
        setError('Access to this document has been revoked or restricted.');
        setChangeMessage('The document owner has changed the sharing settings.');
        setSettingsChanged(true);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message?.includes('expired') || errorData.message?.includes('limit')) {
          setError('This share link has expired or reached its view limit.');
          setChangeMessage('The document is no longer accessible through this link.');
          setSettingsChanged(true);
        }
        return;
      }

      const data: PublicDocumentResponse = await response.json();
      
      // Check if settings have changed
      if (shareSettings) {
        const settingsChanged = 
          shareSettings.allow_download !== data.share_settings.allow_download ||
          shareSettings.allow_copy !== data.share_settings.allow_copy ||
          shareSettings.show_watermark !== data.share_settings.show_watermark;

        if (settingsChanged) {
          setShareSettings(data.share_settings);
          setSettingsChanged(true);
          
          const changes = [];
          if (shareSettings.allow_download && !data.share_settings.allow_download) {
            changes.push('download disabled');
          } else if (!shareSettings.allow_download && data.share_settings.allow_download) {
            changes.push('download enabled');
          }
          
          if (shareSettings.allow_copy && !data.share_settings.allow_copy) {
            changes.push('copy disabled');
          } else if (!shareSettings.allow_copy && data.share_settings.allow_copy) {
            changes.push('copy enabled');
          }
          
          if (!shareSettings.show_watermark && data.share_settings.show_watermark) {
            changes.push('watermark added');
          } else if (shareSettings.show_watermark && !data.share_settings.show_watermark) {
            changes.push('watermark removed');
          }

          if (changes.length > 0) {
            setChangeMessage(`Document settings updated: ${changes.join(', ')}`);
            setTimeout(() => {
              setSettingsChanged(false);
              setChangeMessage(null);
            }, 5000);
          }
        }
      }
    } catch (err) {
      console.error('Status check failed:', err);
    }
  }, [token, urlPassword, shareSettings]);

  useEffect(() => {
    if (token) {
      fetchDocument();
    }
  }, [token, urlPassword, fetchDocument]);

  useEffect(() => {
    if (document && !error && !loading && !showPasswordForm) {
      // Start periodic status checking every 30 seconds
      intervalRef.current = setInterval(checkDocumentStatus, 30000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [document, error, loading, showPasswordForm, checkDocumentStatus]);

  // Highlight code blocks when document content changes
  useEffect(() => {
    if (document && (document.rendered_html || parsedMarkdown)) {
      highlightCode();
    }
  }, [document, document?.rendered_html, parsedMarkdown, highlightCode]);

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
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
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
    const isDeactivated = error.includes('deactivated') || error.includes('does not exist');
    const isExpired = error.includes('expired') || error.includes('limit');
    const isAccessDenied = error.includes('revoked') || error.includes('restricted');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100 flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl w-full max-w-md">
          <div className="card-body text-center">
            <div className="mb-4">
              {isDeactivated && (
                <svg className="w-16 h-16 mx-auto text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              )}
              {isExpired && (
                <svg className="w-16 h-16 mx-auto text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {isAccessDenied && (
                <svg className="w-16 h-16 mx-auto text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
              {!isDeactivated && !isExpired && !isAccessDenied && (
                <svg className="w-16 h-16 mx-auto text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h2 className="card-title justify-center">
              {isDeactivated && <span className="text-warning">Share Deactivated</span>}
              {isExpired && <span className="text-error">Share Expired</span>}
              {isAccessDenied && <span className="text-error">Access Denied</span>}
              {!isDeactivated && !isExpired && !isAccessDenied && <span className="text-error">Error</span>}
            </h2>
            <p className="text-base-content/60 mb-4">{error}</p>
            {changeMessage && (
              <div className="alert alert-info alert-sm mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs">{changeMessage}</span>
              </div>
            )}
            {!isDeactivated && !isExpired && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => fetchDocument()}
              >
                Try Again
              </button>
            )}
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
      {/* Settings Change Notification */}
      {settingsChanged && changeMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="alert alert-info shadow-lg max-w-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold">Document Updated</h3>
              <div className="text-xs">{changeMessage}</div>
            </div>
            <button 
              onClick={() => {
                setSettingsChanged(false);
                setChangeMessage(null);
              }}
              className="btn btn-sm btn-circle btn-ghost"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
            {shareSettings?.allow_copy ? (
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
            ) : (
              <button
                className="btn btn-outline btn-sm btn-disabled opacity-50"
                title="Copy disabled by document owner"
                disabled
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
                Copy Disabled
              </button>
            )}
            {shareSettings?.allow_download ? (
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
            ) : (
              <button
                className="btn btn-primary btn-sm btn-disabled opacity-50"
                title="Download disabled by document owner"
                disabled
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
                Download Disabled
              </button>
            )}
          </div>
        </div>

        {/* Document Content */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {document.rendered_html ? (
              <div 
                className="prose prose-lg max-w-none prose-headings:text-base-content prose-p:text-base-content prose-strong:text-base-content prose-code:text-base-content prose-pre:text-base-content prose-blockquote:text-base-content prose-li:text-base-content"
                dangerouslySetInnerHTML={{ __html: document.rendered_html }}
                style={{
                  userSelect: shareSettings?.allow_copy ? 'text' : 'none',
                  WebkitUserSelect: shareSettings?.allow_copy ? 'text' : 'none',
                  MozUserSelect: shareSettings?.allow_copy ? 'text' : 'none',
                  msUserSelect: shareSettings?.allow_copy ? 'text' : 'none'
                }}
              />
            ) : parsedMarkdown ? (
              <div 
                className="prose prose-lg max-w-none prose-headings:text-base-content prose-p:text-base-content prose-strong:text-base-content prose-code:text-base-content prose-pre:text-base-content prose-blockquote:text-base-content prose-li:text-base-content"
                dangerouslySetInnerHTML={{ __html: parsedMarkdown }}
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