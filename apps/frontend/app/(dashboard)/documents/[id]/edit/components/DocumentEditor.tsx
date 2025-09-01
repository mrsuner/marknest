'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import UncontrolledCrepeEditor, { CrepeEditorHandle } from './UncontrolledCrepeEditor';
import { useGetDocumentQuery, useUpdateDocumentMutation } from '@/lib/store/api/documentsApi';

interface DocumentEditorProps {
  documentId: string;
}

// Debounce helper
function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>();
  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

export default function DocumentEditor({ documentId }: DocumentEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [title, setTitle] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentDocumentId, setCurrentDocumentId] = useState(documentId);
  
  // Editor ref for imperative control
  const editorRef = useRef<CrepeEditorHandle>(null);
  
  // Track if we're loading a new document to prevent save during load
  const isLoadingNewDocumentRef = useRef(false);
  
  // Use RTK Query hooks
  const { data: documentResponse, isLoading, error: queryError, refetch } = useGetDocumentQuery(documentId);
  const [updateDocument, { isLoading: isSaving, error: updateError }] = useUpdateDocumentMutation();
  
  const document = documentResponse?.data;
  const error = queryError || updateError;

  // Auto-save functionality with debouncing
  const handleAutoSave = useCallback(async (content: string) => {
    if (!document || isSaving || isLoadingNewDocumentRef.current) return;
    
    try {
      await updateDocument({
        id: documentId,
        data: {
          title,
          content,
          is_auto_save: true,
          change_summary: 'Auto-save'
        }
      }).unwrap();
      
      setLastSaved(new Date());
    } catch (err) {
      console.error('Auto-save error:', err);
    }
  }, [documentId, document, title, isSaving, updateDocument]);

  // Debounced auto-save (3 seconds after user stops typing)
  const debouncedAutoSave = useDebounce(handleAutoSave, 3000);

  // Handle content changes from editor
  const handleContentChange = useCallback((newContent: string) => {
    // Don't auto-save if we're loading a new document
    if (!isLoadingNewDocumentRef.current) {
      debouncedAutoSave(newContent);
    }
  }, [debouncedAutoSave]);

  // Manual save
  const handleSave = useCallback(async () => {
    if (!document || isSaving || !editorRef.current) return;
    
    const content = editorRef.current.getContent();
    
    try {
      await updateDocument({
        id: documentId,
        data: {
          title,
          content,
          is_auto_save: false,
          change_summary: 'Manual save'
        }
      }).unwrap();
      
      setLastSaved(new Date());
      console.log('Document saved successfully');
    } catch (err) {
      console.error('Error saving document:', err);
    }
  }, [documentId, document, title, isSaving, updateDocument]);

  // Load document content when it changes or on reload
  const handleLoad = useCallback(() => {
    refetch();
  }, [refetch]);

  // Update editor content when document is loaded from API
  useEffect(() => {
    if (document && editorRef.current) {
      isLoadingNewDocumentRef.current = true;
      
      // Update local state
      setTitle(document.title || '');
      
      // Update editor content
      editorRef.current.setContent(document.content || '');
      
      // Allow auto-save after a delay
      setTimeout(() => {
        isLoadingNewDocumentRef.current = false;
      }, 500);
    }
  }, [document]);

  // Handle document ID change (switching documents)
  useEffect(() => {
    if (documentId !== currentDocumentId) {
      isLoadingNewDocumentRef.current = true;
      setCurrentDocumentId(documentId);
    }
  }, [documentId, currentDocumentId]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    // Trigger auto-save when title changes
    if (editorRef.current) {
      debouncedAutoSave(editorRef.current.getContent());
    }
  }, [debouncedAutoSave]);

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
        handleSave();
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
    let errorMessage = 'Document not found';
    if (error && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data) {
      errorMessage = (error.data as { message: string }).message;
    } else if (error) {
      errorMessage = 'Failed to load document';
    }
      
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
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-2 sm:p-4 bg-base-200 border-b border-base-300">
          <div className="flex flex-col sm:flex-row flex-1 gap-2 sm:gap-4">
            <input 
              type="text" 
              value={title} 
              onChange={(e) => handleTitleChange(e.target.value)}
              className="input input-ghost text-base sm:text-lg font-semibold bg-transparent border-none focus:bg-base-100 flex-1"
              placeholder="Document title..."
              aria-label="Document title"
            />
            <div className="flex gap-2 justify-between sm:justify-start">
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className={`btn btn-primary btn-sm ${isSaving ? 'loading' : ''}`}
                  disabled={isSaving}
                  aria-label="Save document"
                >
                  {isSaving ? '' : 'Save'}
                </button>
                <button
                  onClick={handleLoad}
                  className="btn btn-outline btn-sm"
                  disabled={isLoading}
                  aria-label="Reload document"
                >
                  Reload
                </button>
              </div>
              <button
                onClick={exitFullscreen}
                className="btn btn-ghost btn-sm sm:hidden"
                title="Exit Fullscreen (Esc)"
                aria-label="Exit fullscreen"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
            <div className="text-xs text-base-content/50">
              <span className="hidden sm:inline">{document.word_count} words • v{document.version_number}</span>
              <span className="sm:hidden">{document.word_count}w • v{document.version_number}</span>
              {lastSaved && (
                <span className="ml-1 sm:ml-2">• {lastSaved.toLocaleTimeString()}</span>
              )}
            </div>
            <button
              onClick={exitFullscreen}
              className="btn btn-ghost btn-sm hidden sm:flex"
              title="Exit Fullscreen (Esc)"
              aria-label="Exit fullscreen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Fullscreen Editor */}
        <div className="h-[calc(100vh-65px)] sm:h-[calc(100vh-73px)]">
          <UncontrolledCrepeEditor
            ref={editorRef}
            isFullscreen={true}
            initialContent={document.content || ''}
            onContentChange={handleContentChange}
            changeIntervalMs={1000}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Normal Toolbar - Responsive */}
      <div className="bg-base-200 rounded-t-lg p-2 sm:p-4">
        {/* Mobile Layout */}
        <div className="sm:hidden space-y-2">
          {/* Title input row */}
          <input 
            type="text" 
            value={title} 
            onChange={(e) => handleTitleChange(e.target.value)}
            className="input input-ghost text-base font-semibold bg-transparent border-none focus:bg-base-100 w-full"
            placeholder="Document title..."
            aria-label="Document title"
          />
          
          {/* Actions and stats row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className={`btn btn-primary btn-sm ${isSaving ? 'loading' : ''}`}
                disabled={isSaving}
                aria-label="Save document"
              >
                {isSaving ? '' : 'Save'}
              </button>
              <button
                onClick={handleLoad}
                className="btn btn-outline btn-sm"
                disabled={isLoading}
                aria-label="Reload document"
              >
                Reload
              </button>
              <button
                onClick={toggleFullscreen}
                className="btn btn-ghost btn-sm"
                title="Enter Fullscreen"
                aria-label="Enter fullscreen mode"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-base-content/50">
              {document.word_count}w • v{document.version_number}
            </div>
          </div>
          
          {/* Status row - only show if there's content */}
          {(lastSaved || error) && (
            <div className="flex items-center justify-between text-xs">
              {error && (
                <div className="text-error flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Error
                </div>
              )}
              {lastSaved && (
                <div className="text-base-content/50 ml-auto">
                  Saved {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1">
            <input 
              type="text" 
              value={title} 
              onChange={(e) => handleTitleChange(e.target.value)}
              className="input input-ghost text-lg font-semibold bg-transparent border-none focus:bg-base-100 w-full max-w-md lg:max-w-lg"
              placeholder="Document title..."
              aria-label="Document title"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className={`btn btn-primary btn-sm ${isSaving ? 'loading' : ''}`}
                disabled={isSaving}
                aria-label="Save document"
              >
                {isSaving ? '' : 'Save'}
              </button>
              <button
                onClick={handleLoad}
                className="btn btn-outline btn-sm"
                disabled={isLoading}
                aria-label="Reload document"
              >
                Reload
              </button>
              <button
                onClick={toggleFullscreen}
                className="btn btn-ghost btn-sm"
                title="Enter Fullscreen"
                aria-label="Enter fullscreen mode"
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
                Error occurred
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
      </div>

      {/* Normal Editor Container */}
      <div className="border border-base-300 rounded-b-lg overflow-hidden">
        <UncontrolledCrepeEditor
          ref={editorRef}
          isFullscreen={false}
          initialContent={document.content || ''}
          onContentChange={handleContentChange}
          changeIntervalMs={1000}
        />
      </div>
    </div>
  );
}