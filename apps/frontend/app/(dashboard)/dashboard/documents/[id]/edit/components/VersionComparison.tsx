'use client';

import { useState, useMemo } from 'react';
import { useGetDocumentVersionQuery } from '@/lib/store/api/documentsApi';
import type { DocumentVersion } from '@/lib/store/api/documentsApi';

interface VersionComparisonProps {
  documentId: string;
  version1: DocumentVersion;
  version2: DocumentVersion;
  isOpen: boolean;
  onClose: () => void;
}

// Simple diff implementation for demonstration
function computeLineDiff(text1: string, text2: string) {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  const diff: Array<{ type: 'added' | 'removed' | 'unchanged'; content: string; lineNumber1?: number; lineNumber2?: number }> = [];
  
  let i = 0, j = 0;
  let lineNum1 = 1, lineNum2 = 1;
  
  while (i < lines1.length || j < lines2.length) {
    if (i >= lines1.length) {
      // Remaining lines in text2 are additions
      diff.push({ type: 'added', content: lines2[j], lineNumber2: lineNum2 });
      j++;
      lineNum2++;
    } else if (j >= lines2.length) {
      // Remaining lines in text1 are deletions
      diff.push({ type: 'removed', content: lines1[i], lineNumber1: lineNum1 });
      i++;
      lineNum1++;
    } else if (lines1[i] === lines2[j]) {
      // Lines are the same
      diff.push({ 
        type: 'unchanged', 
        content: lines1[i], 
        lineNumber1: lineNum1, 
        lineNumber2: lineNum2 
      });
      i++;
      j++;
      lineNum1++;
      lineNum2++;
    } else {
      // Lines are different - simplified approach
      // Look ahead to see if we can find a match
      let foundMatch = false;
      for (let k = j + 1; k < Math.min(j + 10, lines2.length); k++) {
        if (lines1[i] === lines2[k]) {
          // Found a match ahead in text2, so text2[j] is an addition
          diff.push({ type: 'added', content: lines2[j], lineNumber2: lineNum2 });
          j++;
          lineNum2++;
          foundMatch = true;
          break;
        }
      }
      
      if (!foundMatch) {
        for (let k = i + 1; k < Math.min(i + 10, lines1.length); k++) {
          if (lines1[k] === lines2[j]) {
            // Found a match ahead in text1, so text1[i] is a deletion
            diff.push({ type: 'removed', content: lines1[i], lineNumber1: lineNum1 });
            i++;
            lineNum1++;
            foundMatch = true;
            break;
          }
        }
      }
      
      if (!foundMatch) {
        // No match found nearby, treat as removal and addition
        diff.push({ type: 'removed', content: lines1[i], lineNumber1: lineNum1 });
        diff.push({ type: 'added', content: lines2[j], lineNumber2: lineNum2 });
        i++;
        j++;
        lineNum1++;
        lineNum2++;
      }
    }
  }
  
  return diff;
}

export default function VersionComparison({ 
  documentId, 
  version1, 
  version2, 
  isOpen, 
  onClose 
}: VersionComparisonProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  
  const { data: version1Response } = useGetDocumentVersionQuery(
    { documentId, versionId: version1.id },
    { skip: !isOpen }
  );
  
  const { data: version2Response } = useGetDocumentVersionQuery(
    { documentId, versionId: version2.id },
    { skip: !isOpen || version2.id === 'current' }
  );

  const fullVersion1 = version1Response?.data;
  const fullVersion2 = version2.id === 'current' ? version2 : version2Response?.data;

  const diff = useMemo(() => {
    if (!fullVersion1?.content || !fullVersion2?.content) return [];
    return computeLineDiff(fullVersion1.content, fullVersion2.content);
  }, [fullVersion1?.content, fullVersion2?.content]);

  const stats = useMemo(() => {
    const added = diff.filter(d => d.type === 'added').length;
    const removed = diff.filter(d => d.type === 'removed').length;
    const unchanged = diff.filter(d => d.type === 'unchanged').length;
    
    return { added, removed, unchanged, total: added + removed + unchanged };
  }, [diff]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-lg font-semibold">Version Comparison</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-base-content/70">v{version1.version_number}</span>
              <span className="text-base-content/50">↔</span>
              <span className="text-sm text-base-content/70">v{version2.version_number}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-success rounded"></div>
                +{stats.added}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-error rounded"></div>
                -{stats.removed}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-base-300 rounded"></div>
                ={stats.unchanged}
              </span>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`btn btn-xs ${viewMode === 'side-by-side' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Split
              </button>
              <button
                onClick={() => setViewMode('unified')}
                className={`btn btn-xs ${viewMode === 'unified' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Unified
              </button>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            aria-label="Close comparison"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'side-by-side' ? (
            <div className="flex h-full">
              {/* Left Side - Version 1 */}
              <div className="w-1/2 border-r border-base-300 flex flex-col">
                <div className="p-3 bg-base-200 border-b border-base-300">
                  <h3 className="font-medium text-sm">Version {version1.version_number}</h3>
                  <p className="text-xs text-base-content/70">
                    {new Date(version1.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <pre className="text-xs p-4 whitespace-pre-wrap font-mono">
                    {fullVersion1?.content || 'Loading...'}
                  </pre>
                </div>
              </div>

              {/* Right Side - Version 2 */}
              <div className="w-1/2 flex flex-col">
                <div className="p-3 bg-base-200 border-b border-base-300">
                  <h3 className="font-medium text-sm">Version {version2.version_number}</h3>
                  <p className="text-xs text-base-content/70">
                    {new Date(version2.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <pre className="text-xs p-4 whitespace-pre-wrap font-mono">
                    {fullVersion2?.content || 'Loading...'}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            /* Unified Diff View */
            <div className="h-full overflow-y-auto">
              <div className="p-4">
                {diff.length === 0 ? (
                  <div className="text-center text-base-content/50 py-8">
                    {!fullVersion1?.content || !fullVersion2?.content 
                      ? 'Loading comparison...' 
                      : 'No differences found'
                    }
                  </div>
                ) : (
                  <div className="space-y-0">
                    {diff.map((line, index) => (
                      <div 
                        key={index} 
                        className={`flex items-start gap-2 text-xs font-mono py-1 px-2 ${
                          line.type === 'added' 
                            ? 'bg-success/10 border-l-2 border-success' 
                            : line.type === 'removed' 
                            ? 'bg-error/10 border-l-2 border-error' 
                            : 'hover:bg-base-200/50'
                        }`}
                      >
                        <div className="flex gap-2 text-base-content/50 min-w-0">
                          <span className="w-8 text-right">
                            {line.lineNumber1 || ''}
                          </span>
                          <span className="w-8 text-right">
                            {line.lineNumber2 || ''}
                          </span>
                        </div>
                        <div className="w-4 text-center">
                          {line.type === 'added' ? (
                            <span className="text-success">+</span>
                          ) : line.type === 'removed' ? (
                            <span className="text-error">-</span>
                          ) : (
                            <span className="text-base-content/30"> </span>
                          )}
                        </div>
                        <div className="flex-1 whitespace-pre-wrap min-w-0">
                          {line.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with metadata */}
        <div className="p-4 border-t border-base-300 bg-base-200">
          <div className="flex justify-between items-center text-sm">
            <div className="flex gap-4">
              <span>
                <strong>Version {version1.version_number}:</strong> {version1.word_count} words, {version1.character_count} chars
              </span>
              <span>
                <strong>Version {version2.version_number}:</strong> {version2.word_count} words, {version2.character_count} chars
              </span>
            </div>
            <div className="text-base-content/70">
              Changes: +{stats.added} -{stats.removed}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}