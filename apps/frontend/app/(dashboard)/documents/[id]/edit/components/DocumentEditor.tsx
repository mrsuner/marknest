'use client';

import { useState, useEffect } from 'react';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

interface DocumentEditorProps {
  documentId: string;
}

interface CrepeEditorProps {
  isFullscreen: boolean;
}

const CrepeEditor: React.FC<CrepeEditorProps> = ({ isFullscreen }) => {
  useEditor((root) => {
    return new Crepe({
      root,
      defaultValue: '# Welcome to Marknest\n\nStart writing your markdown content here...'
    });
  });

  return (
    <div
      className={isFullscreen ? "h-screen w-full" : "min-h-[70vh] w-full"}
      style={{
        '--milkdown-color-primary': 'oklch(var(--p))',
        '--milkdown-color-surface': 'oklch(var(--b1))',
        '--milkdown-color-on-surface': 'oklch(var(--bc))',
      } as React.CSSProperties}
    >
      <Milkdown />
    </div>
  );
};

export default function DocumentEditor({ documentId }: DocumentEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleSave = () => {
    // TODO: Implement API call to save document
    console.log('Saving document:', documentId);
  };

  const handleLoad = () => {
    // TODO: Implement API call to load document content
    console.log('Loading document:', documentId);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
  };

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when in fullscreen
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-base-100">
        {/* Fullscreen Toolbar */}
        <div className="flex justify-between items-center p-4 bg-base-200 border-b border-base-300">
          <div className="flex gap-2">
            <button
              onClick={handleLoad}
              className="btn btn-outline btn-sm"
            >
              Load
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary btn-sm"
            >
              Save
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-base-content/70">
              Document ID: {documentId}
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
            <CrepeEditor isFullscreen={true} />
          </MilkdownProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Normal Toolbar */}
      <div className="flex justify-between items-center mb-4 p-4 bg-base-200 rounded-t-lg">
        <div className="flex gap-2">
          <button
            onClick={handleLoad}
            className="btn btn-outline btn-sm"
          >
            Load
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary btn-sm"
          >
            Save
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
        <div className="text-sm text-base-content/70">
          Document ID: {documentId}
        </div>
      </div>

      {/* Normal Editor Container */}
      <div className="border border-base-300 rounded-b-lg overflow-hidden">
        <MilkdownProvider>
          <CrepeEditor isFullscreen={false} />
        </MilkdownProvider>
      </div>
    </div>
  );
}