'use client';

import { useState, useEffect, useCallback } from 'react';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import './editor-theme.css';
import { useGetDocumentQuery, useUpdateDocumentMutation } from '@/lib/store/api/documentsApi';
import type { Document } from '@/lib/store/api/api';

interface DocumentEditorProps {
  documentId: string;
}

interface CrepeEditorProps {
  isFullscreen: boolean;
  content: string;
}

// Using Document type from API instead

const CrepeEditor: React.FC<CrepeEditorProps> = ({ isFullscreen, content }) => {
  useEditor((root) => {
    return new Crepe({
      root,
      defaultValue: content || '# Welcome to Marknest\n\nStart writing your markdown content here...'
    });
  }, [content]);

  return (
    <div
      className={isFullscreen ? "h-screen w-full" : "min-h-[70vh] w-full"}
      style={{
        '--milkdown-color-primary': 'oklch(var(--p))',
        '--milkdown-color-surface': 'oklch(var(--b1))',
        '--milkdown-color-on-surface': 'oklch(var(--bc))',
        '--crepe-color-background': 'oklch(var(--b1))',
        '--crepe-color-on-background': 'oklch(var(--bc))',
        '--crepe-color-surface': 'oklch(var(--b1))',
        '--crepe-color-on-surface': 'oklch(var(--bc))',
      } as React.CSSProperties}
    >
      <Milkdown />
    </div>
  );
};

export default function DocumentEditor({ documentId }: DocumentEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Use RTK Query hooks
  const { data: documentResponse, isLoading, error: queryError, refetch } = useGetDocumentQuery(documentId);
  const [updateDocument, { isLoading: isSaving, error: updateError }] = useUpdateDocumentMutation();
  
  const document = documentResponse?.data;
  const error = queryError || updateError;

  const handleLoad = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSave = useCallback(async (isAutoSave = false) => {
    if (!document || isSaving) return;
    
    try {
      await updateDocument({
        id: documentId,
        data: {
          title,
          content,
          is_auto_save: isAutoSave,
          change_summary: isAutoSave ? 'Auto-save' : 'Manual save'
        }
      }).unwrap();
      
      setLastSaved(new Date());
      
      if (!isAutoSave) {
        console.log('Document saved successfully');
      }
    } catch (err) {
      console.error('Error saving document:', err);
    }
  }, [documentId, document, title, content, isSaving, updateDocument]);

  // Update local state when document is loaded from API
  useEffect(() => {
    if (document) {
      setContent(document.content || '');
      setTitle(document.title || '');
    }
  }, [document]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
  };

  // Handle ESC key to exit fullscreen and Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave(false); // manual save
      }
    };

    if (isFullscreen) {
      window.document.body.style.overflow = 'hidden';
    }
    
    window.document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.document.removeEventListener('keydown', handleKeyDown);
      window.document.body.style.overflow = 'unset';
    };
  }, [isFullscreen, handleSave]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="text-base-content/70">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    const errorMessage = error && 'data' in error && error.data 
      ? (typeof error.data === 'object' && error.data && 'message' in error.data ? (error.data as any).message : 'Failed to load document')
      : 'Document not found';
      
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-error mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Error Loading Document</h3>
          <p className="text-base-content/70 mb-4">{errorMessage}</p>
          <button 
            onClick={handleLoad} 
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-base-100">
        {/* Fullscreen Toolbar */}
        <div className="flex justify-between items-center p-4 bg-base-200 border-b border-base-300">
          <div className="flex items-center gap-4">
            <input 
              type="text" 
              value={title} 
              onChange={(e) => handleTitleChange(e.target.value)}
              className="input input-ghost text-lg font-semibold bg-transparent border-none focus:bg-base-100 w-96"
              placeholder="Document title..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleSave(false)}
                className={`btn btn-primary btn-sm ${isSaving ? 'loading' : ''}`}
                disabled={isSaving}
              >
                {isSaving ? '' : 'Save'}
              </button>
              <button
                onClick={handleLoad}
                className="btn btn-outline btn-sm"
                disabled={isLoading}
              >
                Reload
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-base-content/50">
              {document.word_count} words • v{document.version_number}
              {lastSaved && (
                <span className="ml-2">• Saved {lastSaved.toLocaleTimeString()}</span>
              )}
            </div>
            <button
              onClick={exitFullscreen}
              className="btn btn-ghost btn-sm"
              title="Exit Fullscreen (Esc)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Fullscreen Editor */}
        <div className="h-[calc(100vh-73px)]">
          <MilkdownProvider>
            <CrepeEditor 
              isFullscreen={true} 
              content={content}
            />
          </MilkdownProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Normal Toolbar */}
      <div className="flex justify-between items-center mb-4 p-4 bg-base-200 rounded-t-lg">
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            value={title} 
            onChange={(e) => handleTitleChange(e.target.value)}
            className="input input-ghost text-lg font-semibold bg-transparent border-none focus:bg-base-100 w-80"
            placeholder="Document title..."
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleSave(false)}
              className={`btn btn-primary btn-sm ${isSaving ? 'loading' : ''}`}
              disabled={isSaving}
            >
              {isSaving ? '' : 'Save'}
            </button>
            <button
              onClick={handleLoad}
              className="btn btn-outline btn-sm"
              disabled={isLoading}
            >
              Reload
            </button>
            <button
              onClick={toggleFullscreen}
              className="btn btn-ghost btn-sm"
              title="Enter Fullscreen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {error && (
            <div className="text-error text-sm">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
              {error && 'data' in error && error.data 
                ? (typeof error.data === 'object' && error.data && 'message' in error.data ? (error.data as any).message : 'Error occurred')
                : 'Error occurred'
              }
            </div>
          )}
          <div className="text-xs text-base-content/50">
            {document.word_count} words • v{document.version_number}
            {lastSaved && (
              <span className="ml-2">• Saved {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Normal Editor Container */}
      <div className="border border-base-300 rounded-b-lg overflow-hidden">
        <MilkdownProvider>
          <CrepeEditor 
            isFullscreen={false} 
            content={content}
          />
        </MilkdownProvider>
      </div>
    </div>
  );
}