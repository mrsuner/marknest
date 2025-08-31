<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentVersion;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DocumentController extends Controller
{
    // Basic CRUD operations

    /**
     * Get paginated list of user documents
     * Supports filtering by folder, status (draft/published), favorites, archived
     * Includes sorting by name, created_at, updated_at, last_accessed_at
     * Returns document metadata without full content for performance
     */
    public function index(Request $request): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Create new document
     * Creates document with title, content, folder assignment
     * Auto-generates slug, initializes version history, updates user quota
     * Returns complete document data including first version
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'sometimes|string',
            'folder_id' => 'sometimes|nullable|exists:folders,id',
            'tags' => 'sometimes|array',
            'status' => 'sometimes|in:draft,published'
        ]);
        
        // Validate folder belongs to user if provided
        if (isset($validated['folder_id']) && $validated['folder_id']) {
            $user->folders()->findOrFail($validated['folder_id']);
        }
        
        $content = $validated['content'] ?? '';
        
        $document = DB::transaction(function () use ($validated, $user, $content) {
            $doc = Document::create([
                'title' => $validated['title'],
                'slug' => Str::slug($validated['title']),
                'content' => $content,
                'rendered_html' => $content, // TODO: Render markdown to HTML
                'user_id' => $user->id,
                'folder_id' => $validated['folder_id'] ?? null,
                'size' => strlen($content),
                'word_count' => str_word_count(strip_tags($content)),
                'character_count' => strlen($content),
                'version_number' => 1,
                'tags' => $validated['tags'] ?? [],
                'status' => $validated['status'] ?? 'draft',
                'last_accessed_at' => now()
            ]);
            
            // Create initial version
            DocumentVersion::create([
                'document_id' => $doc->id,
                'user_id' => $user->id,
                'version_number' => 1,
                'title' => $doc->title,
                'content' => $doc->content,
                'rendered_html' => $doc->rendered_html,
                'size' => $doc->size,
                'word_count' => $doc->word_count,
                'character_count' => $doc->character_count,
                'change_summary' => 'Initial version',
                'operation' => 'create',
                'is_auto_save' => false,
                'created_at' => now()
            ]);
            
            return $doc;
        });
        
        return response()->json([
            'data' => [
                'id' => $document->id,
                'title' => $document->title,
                'slug' => $document->slug,
                'content' => $document->content,
                'folder_id' => $document->folder_id,
                'version_number' => $document->version_number,
                'status' => $document->status,
                'tags' => $document->tags,
                'created_at' => $document->created_at,
                'updated_at' => $document->updated_at
            ],
            'message' => 'Document created successfully'
        ], 201);
    }

    /**
     * Get single document by ID
     * Returns full document data including content, metadata, collaborators
     * Updates last_accessed_at, checks user permissions (owner/collaborator)
     * Includes version information and sharing status
     */
    public function show(string $document): JsonResponse
    {
        $user = Auth::user();
        
        $doc = Document::where('id', $document)
            ->where('user_id', $user->id)
            ->where('is_trashed', false)
            ->with(['folder', 'versions' => function($query) {
                $query->orderBy('version_number', 'desc')->limit(5);
            }])
            ->firstOrFail();
        
        // Update last accessed timestamp
        $doc->update(['last_accessed_at' => now()]);
        
        return response()->json([
            'data' => [
                'id' => $doc->id,
                'title' => $doc->title,
                'slug' => $doc->slug,
                'content' => $doc->content,
                'rendered_html' => $doc->rendered_html,
                'folder_id' => $doc->folder_id,
                'folder' => $doc->folder ? [
                    'id' => $doc->folder->id,
                    'name' => $doc->folder->name,
                    'path' => $doc->folder->path
                ] : null,
                'size' => $doc->size,
                'word_count' => $doc->word_count,
                'character_count' => $doc->character_count,
                'version_number' => $doc->version_number,
                'is_favorite' => $doc->is_favorite,
                'is_archived' => $doc->is_archived,
                'tags' => $doc->tags,
                'metadata' => $doc->metadata,
                'status' => $doc->status,
                'created_at' => $doc->created_at,
                'updated_at' => $doc->updated_at,
                'last_accessed_at' => $doc->last_accessed_at,
                'recent_versions' => $doc->versions->map(function($version) {
                    return [
                        'id' => $version->id,
                        'version_number' => $version->version_number,
                        'title' => $version->title,
                        'change_summary' => $version->change_summary,
                        'operation' => $version->operation,
                        'is_auto_save' => $version->is_auto_save,
                        'created_at' => $version->created_at
                    ];
                })
            ]
        ]);
    }

    /**
     * Update document content and metadata
     * Updates title, content, folder, tags, status
     * Creates new version entry, re-renders HTML, updates word count
     * Returns updated document data with new version number
     */
    public function update(Request $request, string $document): JsonResponse
    {
        $user = Auth::user();
        
        $doc = Document::where('id', $document)
            ->where('user_id', $user->id)
            ->where('is_trashed', false)
            ->firstOrFail();
        
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'folder_id' => 'sometimes|nullable|exists:folders,id',
            'tags' => 'sometimes|array',
            'status' => 'sometimes|in:draft,published',
            'is_auto_save' => 'sometimes|boolean',
            'change_summary' => 'sometimes|string|max:500'
        ]);
        
        DB::transaction(function () use ($doc, $validated, $user) {
            $oldContent = $doc->content;
            $oldTitle = $doc->title;
            
            // Update document
            $updateData = [];
            if (isset($validated['title'])) {
                $updateData['title'] = $validated['title'];
                $updateData['slug'] = Str::slug($validated['title']);
            }
            if (isset($validated['content'])) {
                $updateData['content'] = $validated['content'];
                $updateData['word_count'] = str_word_count(strip_tags($validated['content']));
                $updateData['character_count'] = strlen($validated['content']);
                $updateData['size'] = strlen($validated['content']);
                // TODO: Render markdown to HTML
                $updateData['rendered_html'] = $validated['content']; // For now, store as is
            }
            if (isset($validated['folder_id'])) {
                // Validate folder belongs to user
                if ($validated['folder_id']) {
                    $folder = $user->folders()->findOrFail($validated['folder_id']);
                }
                $updateData['folder_id'] = $validated['folder_id'];
            }
            if (isset($validated['tags'])) {
                $updateData['tags'] = $validated['tags'];
            }
            if (isset($validated['status'])) {
                $updateData['status'] = $validated['status'];
            }
            
            // Create version if content or title changed
            if (isset($validated['content']) || isset($validated['title'])) {
                $versionNumber = $doc->version_number + 1;
                $updateData['version_number'] = $versionNumber;
                
                // Create version entry
                DocumentVersion::create([
                    'document_id' => $doc->id,
                    'user_id' => $user->id,
                    'version_number' => $versionNumber,
                    'title' => $validated['title'] ?? $oldTitle,
                    'content' => $validated['content'] ?? $oldContent,
                    'rendered_html' => $updateData['rendered_html'] ?? $doc->rendered_html,
                    'size' => $updateData['size'] ?? $doc->size,
                    'word_count' => $updateData['word_count'] ?? $doc->word_count,
                    'character_count' => $updateData['character_count'] ?? $doc->character_count,
                    'change_summary' => $validated['change_summary'] ?? 'Document updated',
                    'operation' => 'update',
                    'is_auto_save' => $validated['is_auto_save'] ?? false,
                    'created_at' => now()
                ]);
            }
            
            $doc->update($updateData);
        });
        
        return response()->json([
            'data' => [
                'id' => $doc->id,
                'title' => $doc->title,
                'content' => $doc->content,
                'version_number' => $doc->version_number,
                'word_count' => $doc->word_count,
                'character_count' => $doc->character_count,
                'updated_at' => $doc->updated_at
            ],
            'message' => 'Document updated successfully'
        ]);
    }

    /**
     * Delete document (soft delete to trash)
     * Marks document as trashed, preserves data for recovery
     * Updates user storage quota, logs deletion activity
     * Returns success confirmation
     */
    public function destroy(string $document): JsonResponse
    {
        // Implementation pending
    }

    // Document Actions

    /**
     * Create duplicate copy of document
     * Copies content, metadata, and media attachments
     * Creates new document with "(Copy)" suffix, resets sharing
     * Returns new document data
     */
    public function duplicate(string $document): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Toggle document favorite status
     * Adds/removes from favorites list for quick access
     * Updates is_favorite boolean, logs activity
     * Returns updated document status
     */
    public function toggleFavorite(string $document): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Toggle document archive status
     * Moves document to/from archive for organization
     * Updates is_archived boolean, removes from main document list
     * Returns updated document status
     */
    public function toggleArchive(string $document): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Restore document from trash
     * Unmarks trashed status, restores to original folder
     * Updates user storage quota, logs restoration activity
     * Returns restored document data
     */
    public function restore(string $document): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Move document to different folder
     * Updates folder_id, validates destination folder ownership
     * Updates document path, logs move activity
     * Returns updated document with new folder info
     */
    public function move(Request $request, string $document): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Get document statistics
     * Returns word count, character count, reading time estimate
     * Includes view count, last accessed, collaboration stats
     * Version count and size metrics
     */
    public function getStats(string $document): JsonResponse
    {
        // Implementation pending
    }

    // Version History Management

    /**
     * Get document version history
     * Returns paginated list of all document versions
     * Includes version metadata, change summaries, timestamps
     * Excludes full content for performance (use getVersion for content)
     */
    public function getVersions(string $document): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Get specific version content
     * Returns complete version data including full content
     * Used for version preview and comparison
     * Validates version exists and user has access
     */
    public function getVersion(string $document, string $version): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Create manual version snapshot
     * Creates new version entry with optional change description
     * Useful for saving milestones before major edits
     * Returns new version data
     */
    public function createVersion(Request $request, string $document): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Restore document to specific version
     * Copies version content to current document, creates new version entry
     * Updates version number, logs restoration activity
     * Returns updated document with restored content
     */
    public function restoreVersion(string $document, string $version): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Get differences between two versions
     * Compares content changes between current and specified version
     * Returns diff data with additions/deletions highlighted
     * Supports side-by-side and unified diff formats
     */
    public function getVersionDiff(string $document, string $version): JsonResponse
    {
        // Implementation pending
    }

    // Collaboration Management

    /**
     * Get document collaborators
     * Returns list of users with access to document
     * Includes permission levels, invitation status, last activity
     * Shows pending invitations and access history
     */
    public function getCollaborators(string $document): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Add collaborator to document
     * Invites user by email, sets permission level (view/comment/edit)
     * Sends invitation email, logs collaboration activity
     * Returns updated collaborator list
     */
    public function addCollaborator(Request $request, string $document): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Update collaborator permissions
     * Changes permission level, updates access rights
     * Validates permission hierarchy, logs permission changes
     * Returns updated collaborator data
     */
    public function updateCollaborator(Request $request, string $document, string $collaborator): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Remove collaborator access
     * Revokes document access, removes from collaborator list
     * Sends notification email, logs access removal
     * Returns success confirmation
     */
    public function removeCollaborator(string $document, string $collaborator): JsonResponse
    {
        // Implementation pending
    }

    // Public Sharing Management

    /**
     * Get document sharing links
     * Returns list of active public sharing links
     * Includes share settings, access statistics, expiration status
     * Shows password protection and view limits
     */
    public function getShares(string $document): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Create public sharing link
     * Generates secure sharing token, applies access restrictions
     * Sets expiration, password protection, view limits as needed
     * Returns sharing link and configuration
     */
    public function createShare(Request $request, string $document): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Update sharing link settings
     * Modifies expiration, password, view limits, permissions
     * Can disable/enable existing links without changing URL
     * Returns updated sharing configuration
     */
    public function updateShare(Request $request, string $document, string $share): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Delete sharing link
     * Permanently removes public access link
     * Logs deletion activity, notifies if link was actively used
     * Returns success confirmation
     */
    public function deleteShare(string $document, string $share): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Get sharing link statistics
     * Returns view count, access history, geographic data
     * Shows referrer information and access patterns
     * Includes download counts and time-based analytics
     */
    public function getShareStats(string $document, string $share): JsonResponse
    {
        // Implementation pending
    }

    // Media File Management

    /**
     * Get document media attachments
     * Returns list of files attached to document
     * Includes usage context (inline/attachment/cover), order, metadata
     * Shows file details and attachment settings
     */
    public function getMedia(string $document): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Attach media file to document
     * Creates document-media relationship with usage context
     * Sets attachment order, position, and display settings
     * Returns updated media list for document
     */
    public function attachMedia(Request $request, string $document, string $mediaFile): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Update media attachment settings
     * Modifies usage context, order, alt text, display settings
     * Updates attachment metadata without changing file
     * Returns updated attachment configuration
     */
    public function updateMediaAttachment(Request $request, string $document, string $mediaFile): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Remove media from document
     * Removes document-media relationship (keeps original file)
     * Updates attachment order for remaining media
     * Returns updated media list
     */
    public function detachMedia(string $document, string $mediaFile): JsonResponse
    {
        // Implementation pending
    }

    // Document Collections (Special Views)

    /**
     * Get user's favorite documents
     * Returns documents marked as favorites across all folders
     * Supports pagination and sorting options
     * Used for quick access sidebar
     */
    public function getFavorites(Request $request): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Get archived documents
     * Returns documents marked as archived
     * Hidden from main interface but accessible for retrieval
     * Supports search and filtering
     */
    public function getArchived(Request $request): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Get recently accessed documents
     * Returns documents ordered by last_accessed_at
     * Useful for dashboard "continue working" section
     * Excludes trashed and archived documents
     */
    public function getRecent(Request $request): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Get trashed documents
     * Returns soft-deleted documents available for recovery
     * Includes deletion timestamp and recovery deadline
     * Supports permanent deletion after retention period
     */
    public function getTrashed(Request $request): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Get documents shared with current user
     * Returns documents where user is collaborator (not owner)
     * Shows permission level and collaboration activity
     * Grouped by sharing user for organization
     */
    public function getSharedWithMe(Request $request): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Get documents shared by current user
     * Returns documents where user has created sharing links
     * Shows sharing statistics and active collaborations
     * Includes public sharing and private collaboration
     */
    public function getMyShares(Request $request): JsonResponse
    {
        // Implementation pending
    }

    // Search and Discovery

    /**
     * Global search across documents and content
     * Full-text search through document titles and content
     * Supports advanced filters (date range, folder, tags)
     * Returns ranked results with content snippets
     */
    public function globalSearch(Request $request): JsonResponse
    {
        // Implementation pending
    }

    // Public Access (no authentication)

    /**
     * Get public document via sharing token
     * Validates sharing token, checks expiration and limits
     * Records access statistics, enforces view restrictions
     * Returns document content with sharing constraints applied
     */
    public function getPublicDocument(string $token): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Record public document view
     * Logs view event for analytics, updates view counter
     * Tracks referrer and geographic data
     * Enforces view limits if configured
     */
    public function recordPublicView(Request $request, string $token): JsonResponse
    {
        // Implementation pending
    }

    /**
     * Download public document
     * Validates download permissions, generates export
     * Records download event, applies watermarks if enabled
     * Returns file stream or download URL
     */
    public function downloadPublicDocument(Request $request, string $token): JsonResponse
    {
        // Implementation pending
    }
}