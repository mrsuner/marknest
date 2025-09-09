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
            'content' => 'nullable|string',
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
                'slug' => '', // Will be set to ID after creation
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
            
            // Set slug to document ID
            $doc->update(['slug' => $doc->id]);
            
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
                    $user->folders()->findOrFail($validated['folder_id']);
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
                // Get the highest version number for this document to prevent race conditions
                $maxVersion = DocumentVersion::where('document_id', $doc->id)->max('version_number') ?? 0;
                $versionNumber = $maxVersion + 1;
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
     * Get document versions
     * Returns paginated list of versions for a document
     * Includes version metadata and change summaries
     */
    public function getVersions(Request $request, string $document): JsonResponse
    {
        $user = Auth::user();
        
        $doc = Document::where('id', $document)
            ->where('user_id', $user->id)
            ->where('is_trashed', false)
            ->firstOrFail();
        
        $validated = $request->validate([
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:50',
        ]);
        
        $perPage = $validated['per_page'] ?? 10;
        
        $versions = DocumentVersion::where('document_id', $doc->id)
            ->with('user:id,name,email')
            ->orderBy('version_number', 'desc')
            ->paginate($perPage);
        
        return response()->json([
            'data' => $versions->map(function ($version) {
                return [
                    'id' => $version->id,
                    'version_number' => $version->version_number,
                    'title' => $version->title,
                    'word_count' => $version->word_count,
                    'character_count' => $version->character_count,
                    'change_summary' => $version->change_summary,
                    'operation' => $version->operation,
                    'is_auto_save' => $version->is_auto_save,
                    'created_at' => $version->created_at,
                    'user' => $version->user ? [
                        'id' => $version->user->id,
                        'name' => $version->user->name,
                        'email' => $version->user->email,
                    ] : null,
                ];
            }),
            'meta' => [
                'current_page' => $versions->currentPage(),
                'last_page' => $versions->lastPage(),
                'per_page' => $versions->perPage(),
                'total' => $versions->total(),
            ],
        ]);
    }

    /**
     * Get specific version of a document
     * Returns full content and metadata for a specific version
     */
    public function getVersion(string $document, string $versionId): JsonResponse
    {
        $user = Auth::user();
        
        $doc = Document::where('id', $document)
            ->where('user_id', $user->id)
            ->where('is_trashed', false)
            ->firstOrFail();
        
        $version = DocumentVersion::where('id', $versionId)
            ->where('document_id', $doc->id)
            ->with('user:id,name,email')
            ->firstOrFail();
        
        return response()->json([
            'data' => [
                'id' => $version->id,
                'document_id' => $version->document_id,
                'version_number' => $version->version_number,
                'title' => $version->title,
                'content' => $version->content,
                'rendered_html' => $version->rendered_html,
                'size' => $version->size,
                'word_count' => $version->word_count,
                'character_count' => $version->character_count,
                'change_summary' => $version->change_summary,
                'diff' => $version->diff,
                'operation' => $version->operation,
                'is_auto_save' => $version->is_auto_save,
                'created_at' => $version->created_at,
                'user' => $version->user ? [
                    'id' => $version->user->id,
                    'name' => $version->user->name,
                    'email' => $version->user->email,
                ] : null,
            ],
        ]);
    }

    /**
     * Restore a specific version of a document
     * Creates a new version with the content from the specified version
     */
    public function restoreVersion(Request $request, string $document, string $versionId): JsonResponse
    {
        $user = Auth::user();
        
        $doc = Document::where('id', $document)
            ->where('user_id', $user->id)
            ->where('is_trashed', false)
            ->firstOrFail();
        
        $version = DocumentVersion::where('id', $versionId)
            ->where('document_id', $doc->id)
            ->firstOrFail();
        
        $validated = $request->validate([
            'change_summary' => 'sometimes|string|max:500',
        ]);
        
        DB::transaction(function () use ($doc, $version, $user, $validated) {
            // Get the highest version number
            $maxVersion = DocumentVersion::where('document_id', $doc->id)->max('version_number') ?? 0;
            $newVersionNumber = $maxVersion + 1;
            
            // Update the document with the restored version's content
            $doc->update([
                'title' => $version->title,
                'content' => $version->content,
                'rendered_html' => $version->rendered_html,
                'size' => $version->size,
                'word_count' => $version->word_count,
                'character_count' => $version->character_count,
                'version_number' => $newVersionNumber,
            ]);
            
            // Create a new version entry
            DocumentVersion::create([
                'document_id' => $doc->id,
                'user_id' => $user->id,
                'version_number' => $newVersionNumber,
                'title' => $version->title,
                'content' => $version->content,
                'rendered_html' => $version->rendered_html,
                'size' => $version->size,
                'word_count' => $version->word_count,
                'character_count' => $version->character_count,
                'change_summary' => $validated['change_summary'] ?? "Restored from version {$version->version_number}",
                'operation' => 'restore',
                'is_auto_save' => false,
                'created_at' => now(),
            ]);
        });
        
        return response()->json([
            'data' => [
                'id' => $doc->id,
                'title' => $doc->title,
                'version_number' => $doc->version_number,
                'message' => 'Version restored successfully',
            ],
        ]);
    }

    /**
     * Get recently accessed documents
     * Returns documents ordered by last_accessed_at
     * Useful for dashboard "continue working" section
     * Excludes trashed and archived documents
     */
    public function getRecent(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'search' => 'sometimes|string|max:255',
            'sort_by' => 'sometimes|in:updated_at,title,word_count,created_at',
            'sort_direction' => 'sometimes|in:asc,desc'
        ]);
        
        $perPage = $validated['per_page'] ?? 9;
        $search = $validated['search'] ?? null;
        $sortBy = $validated['sort_by'] ?? 'updated_at';
        $sortDirection = $validated['sort_direction'] ?? 'desc';
        
        $query = Document::where('user_id', $user->id)
            ->where('is_trashed', false)
            ->where('is_archived', false)
            ->with('folder:id,name,path');
        
        // Apply search filter if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }
        
        // Apply sorting
        $query->orderBy($sortBy, $sortDirection);
        
        // If not sorting by updated_at, add it as secondary sort
        if ($sortBy !== 'updated_at') {
            $query->orderBy('updated_at', 'desc');
        }
        
        $documents = $query->paginate($perPage);
        
        return response()->json([
            'data' => $documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'title' => $doc->title,
                    'content' => $doc->content,
                    'slug' => $doc->slug,
                    'folder_id' => $doc->folder_id,
                    'folder_name' => $doc->folder?->name,
                    'folder_path' => $doc->folder?->path,
                    'word_count' => $doc->word_count,
                    'character_count' => $doc->character_count,
                    'size' => $doc->size,
                    'version_number' => $doc->version_number,
                    'is_favorite' => $doc->is_favorite,
                    'tags' => $doc->tags,
                    'status' => $doc->status,
                    'created_at' => $doc->created_at,
                    'updated_at' => $doc->updated_at,
                    'last_accessed_at' => $doc->last_accessed_at
                ];
            }),
            'meta' => [
                'current_page' => $documents->currentPage(),
                'last_page' => $documents->lastPage(),
                'per_page' => $documents->perPage(),
                'total' => $documents->total(),
                'from' => $documents->firstItem(),
                'to' => $documents->lastItem()
            ],
            'links' => [
                'first' => $documents->url(1),
                'last' => $documents->url($documents->lastPage()),
                'prev' => $documents->previousPageUrl(),
                'next' => $documents->nextPageUrl()
            ]
        ]);
    }

    /**
     * Duplicate an existing document
     * Creates a new document with the same content but prefixed with "Copy of" in title
     * Preserves folder location, tags, and other metadata but resets versioning
     * Returns the newly created duplicate document
     */
    public function duplicate(Request $request, Document $document): JsonResponse
    {
        $user = Auth::user();
        
        // Ensure the document belongs to the user
        if ($document->user_id !== $user->id) {
            return response()->json([
                'message' => 'Document not found'
            ], 404);
        }
        
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'folder_id' => 'sometimes|nullable|exists:folders,id'
        ]);
        
        // Generate new title (use provided title or add "Copy of" prefix)
        $newTitle = $validated['title'] ?? 'Copy of ' . $document->title;
        
        // Use provided folder_id or keep the same as original
        $folderId = isset($validated['folder_id']) ? $validated['folder_id'] : $document->folder_id;
        
        // Validate folder belongs to user if provided
        if ($folderId) {
            $user->folders()->findOrFail($folderId);
        }
        
        $duplicatedDocument = DB::transaction(function () use ($document, $user, $newTitle, $folderId) {
            // Create the duplicate document
            $duplicate = Document::create([
                'title' => $newTitle,
                'slug' => '', // Will be set to ID after creation
                'content' => $document->content,
                'rendered_html' => $document->rendered_html,
                'user_id' => $user->id,
                'folder_id' => $folderId,
                'size' => $document->size,
                'word_count' => $document->word_count,
                'character_count' => $document->character_count,
                'version_number' => 1,
                'tags' => $document->tags,
                'metadata' => $document->metadata,
                'status' => 'draft', // Reset to draft status
                'is_favorite' => false, // Reset favorite status
                'is_archived' => false,
                'is_trashed' => false,
                'last_accessed_at' => now()
            ]);
            
            // Set slug to document ID
            $duplicate->update(['slug' => $duplicate->id]);
            
            // Create initial version for the duplicate
            DocumentVersion::create([
                'document_id' => $duplicate->id,
                'user_id' => $user->id,
                'version_number' => 1,
                'title' => $duplicate->title,
                'content' => $duplicate->content,
                'rendered_html' => $duplicate->rendered_html,
                'size' => $duplicate->size,
                'word_count' => $duplicate->word_count,
                'character_count' => $duplicate->character_count,
                'change_summary' => 'Duplicated from document: ' . $document->title,
                'operation' => 'create',
                'is_auto_save' => false,
                'created_at' => now()
            ]);
            
            return $duplicate;
        });
        
        return response()->json([
            'data' => [
                'id' => $duplicatedDocument->id,
                'title' => $duplicatedDocument->title,
                'slug' => $duplicatedDocument->slug,
                'content' => $duplicatedDocument->content,
                'folder_id' => $duplicatedDocument->folder_id,
                'version_number' => $duplicatedDocument->version_number,
                'status' => $duplicatedDocument->status,
                'tags' => $duplicatedDocument->tags,
                'created_at' => $duplicatedDocument->created_at,
                'updated_at' => $duplicatedDocument->updated_at
            ],
            'message' => 'Document duplicated successfully'
        ], 201);
    }

}