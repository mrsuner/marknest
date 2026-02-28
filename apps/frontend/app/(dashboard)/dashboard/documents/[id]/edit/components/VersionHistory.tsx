'use client';

import { useState } from 'react';
import { 
  useGetDocumentVersionsQuery, 
  useGetDocumentVersionQuery, 
  useRestoreDocumentVersionMutation,
  type DocumentVersion
} from '@/lib/store/api/documentsApi';
import { formatDistanceToNow } from 'date-fns';

interface VersionHistoryProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  onPreviewVersion: (version: DocumentVersion) => void;
  onCompareVersions?: (version1: DocumentVersion, version2: DocumentVersion) => void;
  currentVersion?: number;
}

export default function VersionHistory({ 
  documentId, 
  isOpen, 
  onClose, 
  onPreviewVersion,
  onCompareVersions,
  currentVersion 
}: VersionHistoryProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<string | null>(null);

  const { 
    data: versionsResponse, 
    isLoading: versionsLoading, 
    error: versionsError,
    refetch: refetchVersions
  } = useGetDocumentVersionsQuery(
    { documentId, perPage: 20 },
    { skip: !isOpen }
  );

  const {
    data: selectedVersionResponse,
    isLoading: versionLoading,
  } = useGetDocumentVersionQuery(
    { documentId, versionId: selectedVersionId! },
    { skip: !selectedVersionId }
  );

  const [restoreVersion, { isLoading: restoring }] = useRestoreDocumentVersionMutation();

  const versions = versionsResponse?.data || [];
  const selectedVersion = selectedVersionResponse?.data;

  const handleVersionClick = (version: DocumentVersion) => {
    if (selectedVersionId === version.id) {
      setSelectedVersionId(null);
      return;
    }
    setSelectedVersionId(version.id);
  };

  const handlePreview = (version: DocumentVersion) => {
    onPreviewVersion(version);
  };

  const handleRestore = async (versionId: string, versionNumber: number) => {
    try {
      await restoreVersion({
        documentId,
        versionId,
        changeSummary: `Restored from version ${versionNumber}`,
      }).unwrap();
      setShowRestoreConfirm(null);
      refetchVersions();
      onClose();
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'create':
        return (
          <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'update':
        return (
          <svg className="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'restore':
        return (
          <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-semibold">Version History</h2>
            <span className="badge badge-ghost">{versions.length} versions</span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            aria-label="Close version history"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Versions List */}
          <div className="w-1/2 border-r border-base-300 flex flex-col">
            <div className="p-3 bg-base-200 border-b border-base-300">
              <h3 className="font-medium text-sm">All Versions</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {versionsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="loading loading-spinner loading-md"></div>
                </div>
              ) : versionsError ? (
                <div className="p-4 text-center text-error">
                  Failed to load versions
                </div>
              ) : versions.length === 0 ? (
                <div className="p-4 text-center text-base-content/50">
                  No versions found
                </div>
              ) : (
                <div className="p-2">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className={`p-3 rounded-lg border mb-2 cursor-pointer transition-all hover:bg-base-200 ${
                        selectedVersionId === version.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-base-300'
                      } ${
                        version.version_number === currentVersion 
                          ? 'ring-2 ring-success ring-opacity-30' 
                          : ''
                      }`}
                      onClick={() => handleVersionClick(version)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getOperationIcon(version.operation)}
                          <span className="font-medium text-sm">
                            Version {version.version_number}
                          </span>
                          {version.version_number === currentVersion && (
                            <span className="badge badge-success badge-sm">Current</span>
                          )}
                          {version.is_auto_save && (
                            <span className="badge badge-ghost badge-sm">Auto</span>
                          )}
                        </div>
                        <span className="text-xs text-base-content/50">
                          {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="text-sm text-base-content/70 mb-1">
                        {version.change_summary || 'No description'}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-base-content/50">
                        <span>{version.word_count} words</span>
                        <span>{version.character_count} chars</span>
                        {version.user && (
                          <span>by {version.user.name}</span>
                        )}
                      </div>
                      
                      {selectedVersionId === version.id && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(version);
                            }}
                            className="btn btn-sm btn-outline"
                          >
                            Preview
                          </button>
                          {onCompareVersions && version.version_number !== currentVersion && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentVer: DocumentVersion = {
                                  id: 'current',
                                  version_number: currentVersion || 1,
                                  title: 'Current Version',
                                  word_count: 0,
                                  character_count: 0,
                                  change_summary: 'Current version',
                                  operation: 'update',
                                  is_auto_save: false,
                                  created_at: new Date().toISOString(),
                                  user: null,
                                };
                                onCompareVersions(version, currentVer);
                              }}
                              className="btn btn-sm btn-secondary"
                            >
                              Compare
                            </button>
                          )}
                          {version.version_number !== currentVersion && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowRestoreConfirm(version.id);
                              }}
                              className="btn btn-sm btn-primary"
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Version Preview */}
          <div className="w-1/2 flex flex-col">
            <div className="p-3 bg-base-200 border-b border-base-300">
              <h3 className="font-medium text-sm">
                {selectedVersion ? `Version ${selectedVersion.version_number} Preview` : 'Select a version to preview'}
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {versionLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="loading loading-spinner loading-md"></div>
                </div>
              ) : selectedVersion ? (
                <div className="space-y-4">
                  {/* Version metadata */}
                  <div className="bg-base-200 rounded-lg p-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Title:</span> {selectedVersion.title}
                      </div>
                      <div>
                        <span className="font-medium">Operation:</span> {selectedVersion.operation}
                      </div>
                      <div>
                        <span className="font-medium">Word Count:</span> {selectedVersion.word_count}
                      </div>
                      <div>
                        <span className="font-medium">Characters:</span> {selectedVersion.character_count}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Created:</span> {new Date(selectedVersion.created_at).toLocaleString()}
                      </div>
                      {selectedVersion.user && (
                        <div className="col-span-2">
                          <span className="font-medium">Author:</span> {selectedVersion.user.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Content preview */}
                  <div>
                    <h4 className="font-medium mb-2">Content Preview:</h4>
                    <div className="bg-base-200 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {selectedVersion.content ? 
                        selectedVersion.content.slice(0, 2000) + (selectedVersion.content.length > 2000 ? '...' : '') :
                        'No content'
                      }
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-base-content/50">
                  Select a version from the list to view its details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Restore Version</h3>
            <p className="text-base-content/70 mb-6">
              Are you sure you want to restore this version? This will create a new version with the restored content.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRestoreConfirm(null)}
                className="btn btn-ghost"
                disabled={restoring}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const version = versions.find(v => v.id === showRestoreConfirm);
                  if (version) {
                    handleRestore(version.id, version.version_number);
                  }
                }}
                className={`btn btn-primary ${restoring ? 'loading' : ''}`}
                disabled={restoring}
              >
                {restoring ? '' : 'Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}