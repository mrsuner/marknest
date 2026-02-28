'use client';

import React, { forwardRef, useImperativeHandle, useEffect, useRef, memo, useState } from 'react';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import './editor-theme.css';

export interface CrepeEditorHandle {
  setContent: (markdown: string) => void;
  getContent: () => string;
  focus: () => void;
  destroy: () => void;
}

interface UncontrolledCrepeEditorProps {
  isFullscreen: boolean;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  changeIntervalMs?: number;
}

const CrepeEditorCore = forwardRef<CrepeEditorHandle, UncontrolledCrepeEditorProps>(
  ({ isFullscreen, initialContent = '', onContentChange, changeIntervalMs = 1000 }, ref) => {
    const editorRef = useRef<Crepe | null>(null);
    const lastContentRef = useRef<string>(initialContent);
    const isSettingContentRef = useRef<boolean>(false);
    const [editorKey, setEditorKey] = useState(0);
    const [pendingContent, setPendingContent] = useState<string | null>(null);

    // Create editor instance
    useEditor((root) => {
      const content = pendingContent !== null ? pendingContent : initialContent;
      const crepe = new Crepe({
        root,
        defaultValue: content || '# Welcome to Marknest\n\nStart writing your markdown content here...'
      });
      
      editorRef.current = crepe;
      lastContentRef.current = content;
      
      // Clear pending content after using it
      if (pendingContent !== null) {
        setPendingContent(null);
        isSettingContentRef.current = false;
      }
      
      return crepe;
    }, [editorKey]); // Recreate when key changes

    // Expose imperative handle with editor methods
    useImperativeHandle(ref, () => ({
      setContent: (markdown: string) => {
        if (markdown === lastContentRef.current) return;
        
        // Set flag to prevent feedback loop
        isSettingContentRef.current = true;
        lastContentRef.current = markdown;
        
        // Destroy current editor and recreate with new content
        if (editorRef.current) {
          try {
            editorRef.current.destroy();
            editorRef.current = null;
          } catch {
            // Ignore destroy errors
          }
        }
        
        // Set pending content and trigger recreation
        setPendingContent(markdown);
        setEditorKey(prev => prev + 1);
      },
      
      getContent: () => {
        if (!editorRef.current) return '';
        try {
          return editorRef.current.getMarkdown() || '';
        } catch (error) {
          console.error('Failed to get editor content:', error);
          return '';
        }
      },
      
      focus: () => {
        if (!editorRef.current) return;
        try {
          // Try to focus the editor element
          const editor = editorRef.current.editor;
          if (editor) {
            editor.action((ctx: { get: (key: string) => { call: (cmd: string) => void } }) => {
              ctx.get('commandsCtx').call('focus');
            });
          }
        } catch (error) {
          console.error('Failed to focus editor:', error);
        }
      },
      
      destroy: () => {
        if (!editorRef.current) return;
        try {
          editorRef.current.destroy();
          editorRef.current = null;
        } catch (error) {
          console.error('Failed to destroy editor:', error);
        }
      }
    }), []);

    // Set up content change monitoring
    useEffect(() => {
      if (!editorRef.current || !onContentChange) return;

      const intervalId = setInterval(() => {
        // Skip if we're programmatically setting content
        if (isSettingContentRef.current) return;
        
        try {
          const currentContent = editorRef.current?.getMarkdown?.() || '';
          
          // Only fire onChange if content actually changed
          if (currentContent !== lastContentRef.current) {
            lastContentRef.current = currentContent;
            onContentChange(currentContent);
          }
        } catch {
          // Silently ignore errors during content polling
        }
      }, changeIntervalMs);

      return () => {
        clearInterval(intervalId);
      };
    }, [onContentChange, changeIntervalMs, editorKey]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (editorRef.current) {
          try {
            editorRef.current.destroy();
          } catch (error) {
            console.error('Error destroying editor on unmount:', error);
          }
        }
      };
    }, []);

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
  }
);

CrepeEditorCore.displayName = 'CrepeEditorCore';

// Wrap with MilkdownProvider and memo for optimization
const UncontrolledCrepeEditor = memo(forwardRef<CrepeEditorHandle, UncontrolledCrepeEditorProps>(
  (props, ref) => {
    return (
      <MilkdownProvider>
        <CrepeEditorCore ref={ref} {...props} />
      </MilkdownProvider>
    );
  }
));

UncontrolledCrepeEditor.displayName = 'UncontrolledCrepeEditor';

export default UncontrolledCrepeEditor;