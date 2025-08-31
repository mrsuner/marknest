'use client';

import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

interface DocumentEditorProps {
  documentId: string;
}

const CrepeEditor: React.FC = () => {
  useEditor((root) => {
    return new Crepe({
      root,
      defaultValue: '# Welcome to Marknest\n\nStart writing your markdown content here...'
    });
  });

  return (
    <div
      className="min-h-[500px] w-full"
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
  const handleSave = () => {
    // TODO: Implement API call to save document
    console.log('Saving document:', documentId);
  };

  const handleLoad = () => {
    // TODO: Implement API call to load document content
    console.log('Loading document:', documentId);
  };

  return (
    <div className="w-full">
      {/* Toolbar */}
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
        </div>
        <div className="text-sm text-base-content/70">
          Document ID: {documentId}
        </div>
      </div>

      {/* Editor Container */}
      <div className="border border-base-300 rounded-b-lg overflow-hidden">
        <MilkdownProvider>
          <CrepeEditor />
        </MilkdownProvider>
      </div>
    </div>
  );
}