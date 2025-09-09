<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Document\DuplicateDocumentRequest;
use App\Http\Requests\Document\GetRecentDocumentsRequest;
use App\Http\Requests\Document\GetVersionsRequest;
use App\Http\Requests\Document\RestoreVersionRequest;
use App\Http\Requests\Document\StoreDocumentRequest;
use App\Http\Requests\Document\UpdateDocumentRequest;
use App\Models\Document;
use App\Services\Document\DocumentService;
use App\Services\Document\DocumentVersionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DocumentController extends Controller
{
    private DocumentService $documentService;

    private DocumentVersionService $versionService;

    /**
     * DocumentController constructor.
     */
    public function __construct(
        DocumentService $documentService,
        DocumentVersionService $versionService
    ) {
        $this->documentService = $documentService;
        $this->versionService = $versionService;
    }

    /**
     * Create a new document.
     *
     * Creates a new document with the specified title, content, and optional folder assignment.
     * Automatically generates a slug, initializes version history, and updates user quota.
     *
     * @param  StoreDocumentRequest  $request  Validated request containing document data
     * @return JsonResponse JSON response with created document data and success message
     *
     * @api POST /api/documents
     *
     * @apiBody {string} title Required. Document title (max 255 characters)
     * @apiBody {string} [content] Optional. Document content in markdown format
     * @apiBody {int} [folder_id] Optional. ID of folder to place document in
     * @apiBody {array} [tags] Optional. Array of tags for categorization
     * @apiBody {string} [status=draft] Optional. Document status (draft|published)
     *
     * @apiSuccess (201) {object} data Document object with id, title, slug, content, etc.
     * @apiSuccess (201) {string} message Success message
     */
    public function store(StoreDocumentRequest $request): JsonResponse
    {
        $user = Auth::user();
        $validated = $request->validated();

        $document = $this->documentService->createDocument($validated, $user);

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
                'updated_at' => $document->updated_at,
            ],
            'message' => 'Document created successfully',
        ], 201);
    }

    /**
     * Get a single document by ID.
     *
     * Retrieves full document data including content, metadata, and recent versions.
     * Updates the last_accessed_at timestamp and checks user permissions.
     *
     * @param  string  $document  Document ID to retrieve
     * @return JsonResponse JSON response with document data or 404 if not found
     *
     * @api GET /api/documents/{id}
     *
     * @apiParam {string} id Document unique ID
     *
     * @apiSuccess (200) {object} data Complete document object with all fields
     * @apiSuccess (200) {object} data.folder Folder information if document is in a folder
     * @apiSuccess (200) {array} data.recent_versions List of 5 most recent versions
     *
     * @apiError (404) Document not found or user lacks permission
     */
    public function show(string $document): JsonResponse
    {
        $user = Auth::user();

        $doc = $this->documentService->getDocument($document, $user);

        if (! $doc) {
            return response()->json(['message' => 'Document not found'], 404);
        }

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
                    'path' => $doc->folder->path,
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
                'recent_versions' => $doc->versions->map(function ($version) {
                    return [
                        'id' => $version->id,
                        'version_number' => $version->version_number,
                        'title' => $version->title,
                        'change_summary' => $version->change_summary,
                        'operation' => $version->operation,
                        'is_auto_save' => $version->is_auto_save,
                        'created_at' => $version->created_at,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Update document content and metadata.
     *
     * Updates document title, content, folder, tags, or status. Creates a new version entry
     * when content or title changes. Re-renders HTML and updates word count automatically.
     *
     * @param  UpdateDocumentRequest  $request  Validated request with update data
     * @param  string  $document  Document ID to update
     * @return JsonResponse JSON response with updated document data
     *
     * @api PUT /api/documents/{id}
     *
     * @apiParam {string} id Document unique ID
     *
     * @apiBody {string} [title] Optional. New document title
     * @apiBody {string} [content] Optional. New document content
     * @apiBody {int} [folder_id] Optional. New folder ID or null to remove from folder
     * @apiBody {array} [tags] Optional. New tags array
     * @apiBody {string} [status] Optional. New status (draft|published)
     * @apiBody {boolean} [is_auto_save] Optional. Whether this is an auto-save
     * @apiBody {string} [change_summary] Optional. Summary of changes (max 500 chars)
     *
     * @apiSuccess (200) {object} data Updated document with new version number
     *
     * @apiError (404) Document not found or user lacks permission
     */
    public function update(UpdateDocumentRequest $request, string $document): JsonResponse
    {
        $user = Auth::user();

        $doc = Document::where('id', $document)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $validated = $request->validated();

        $updatedDoc = $this->documentService->updateDocument($doc, $validated, $user);

        return response()->json([
            'data' => [
                'id' => $updatedDoc->id,
                'title' => $updatedDoc->title,
                'content' => $updatedDoc->content,
                'version_number' => $updatedDoc->version_number,
                'word_count' => $updatedDoc->word_count,
                'character_count' => $updatedDoc->character_count,
                'updated_at' => $updatedDoc->updated_at,
            ],
            'message' => 'Document updated successfully',
        ]);
    }

    /**
     * Get document version history.
     *
     * Returns a paginated list of all versions for a document, ordered by version number
     * in descending order. Includes version metadata and change summaries.
     *
     * @param  GetVersionsRequest  $request  Validated request with pagination parameters
     * @param  string  $document  Document ID to get versions for
     * @return JsonResponse JSON response with paginated versions and metadata
     *
     * @api GET /api/documents/{id}/versions
     *
     * @apiParam {string} id Document unique ID
     *
     * @apiQuery {int} [page=1] Page number for pagination
     * @apiQuery {int} [per_page=10] Items per page (max 50)
     *
     * @apiSuccess (200) {array} data Array of version objects
     * @apiSuccess (200) {object} meta Pagination metadata
     *
     * @apiError (404) Document not found or user lacks permission
     */
    public function getVersions(GetVersionsRequest $request, string $document): JsonResponse
    {
        $user = Auth::user();

        $doc = Document::where('id', $document)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $validated = $request->validated();
        $perPage = $validated['per_page'] ?? 10;

        $versions = $this->versionService->getVersions($doc, $perPage);

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
     * Get a specific version of a document.
     *
     * Returns full content and metadata for a specific version, including the complete
     * document content at that point in time.
     *
     * @param  string  $document  Document ID
     * @param  string  $versionId  Version ID to retrieve
     * @return JsonResponse JSON response with version details
     *
     * @api GET /api/documents/{id}/versions/{versionId}
     *
     * @apiParam {string} id Document unique ID
     * @apiParam {string} versionId Version unique ID
     *
     * @apiSuccess (200) {object} data Complete version object with content
     *
     * @apiError (404) Document or version not found
     */
    public function getVersion(string $document, string $versionId): JsonResponse
    {
        $user = Auth::user();

        $doc = Document::where('id', $document)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $version = $this->versionService->getVersion($doc, $versionId);

        if (! $version) {
            return response()->json(['message' => 'Version not found'], 404);
        }

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
     * Restore a document to a specific version.
     *
     * Creates a new version with content from the specified version, effectively rolling
     * back the document to that state while preserving version history.
     *
     * @param  RestoreVersionRequest  $request  Validated request with optional change summary
     * @param  string  $document  Document ID
     * @param  string  $versionId  Version ID to restore to
     * @return JsonResponse JSON response with restored document data
     *
     * @api POST /api/documents/{id}/versions/{versionId}/restore
     *
     * @apiParam {string} id Document unique ID
     * @apiParam {string} versionId Version ID to restore
     *
     * @apiBody {string} [change_summary] Optional. Custom summary for the restore operation
     *
     * @apiSuccess (200) {object} data Document with new version number after restoration
     *
     * @apiError (404) Document or version not found
     */
    public function restoreVersion(RestoreVersionRequest $request, string $document, string $versionId): JsonResponse
    {
        $user = Auth::user();

        $doc = Document::where('id', $document)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $version = $this->versionService->getVersion($doc, $versionId);

        if (! $version) {
            return response()->json(['message' => 'Version not found'], 404);
        }

        $validated = $request->validated();

        $restoredDoc = $this->versionService->restoreVersion(
            $doc,
            $version,
            $user,
            $validated['change_summary'] ?? null
        );

        return response()->json([
            'data' => [
                'id' => $restoredDoc->id,
                'title' => $restoredDoc->title,
                'version_number' => $restoredDoc->version_number,
                'message' => 'Version restored successfully',
            ],
        ]);
    }

    /**
     * Get recently accessed documents.
     *
     * Returns documents ordered by last_accessed_at timestamp, useful for dashboard
     * "continue working" sections. Excludes trashed and archived documents.
     *
     * @param  GetRecentDocumentsRequest  $request  Validated request with filters and pagination
     * @return JsonResponse JSON response with paginated recent documents
     *
     * @api GET /api/documents/recent
     *
     * @apiQuery {int} [page=1] Page number for pagination
     * @apiQuery {int} [per_page=9] Items per page (max 100)
     * @apiQuery {string} [search] Search term to filter by title or content
     * @apiQuery {string} [sort_by=updated_at] Sort field (updated_at|title|word_count|created_at)
     * @apiQuery {string} [sort_direction=desc] Sort direction (asc|desc)
     *
     * @apiSuccess (200) {array} data Array of document objects
     * @apiSuccess (200) {object} meta Pagination metadata
     * @apiSuccess (200) {object} links Pagination links
     */
    public function getRecent(GetRecentDocumentsRequest $request): JsonResponse
    {
        $user = Auth::user();
        $validated = $request->validated();

        $documents = $this->documentService->getRecentDocuments($user, $validated);

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
                    'last_accessed_at' => $doc->last_accessed_at,
                ];
            }),
            'meta' => [
                'current_page' => $documents->currentPage(),
                'last_page' => $documents->lastPage(),
                'per_page' => $documents->perPage(),
                'total' => $documents->total(),
                'from' => $documents->firstItem(),
                'to' => $documents->lastItem(),
            ],
            'links' => [
                'first' => $documents->url(1),
                'last' => $documents->url($documents->lastPage()),
                'prev' => $documents->previousPageUrl(),
                'next' => $documents->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Duplicate an existing document.
     *
     * Creates a new document with the same content but with "Copy of" prefix in title
     * by default. Preserves folder location, tags, and metadata but resets versioning
     * and status to draft.
     *
     * @param  DuplicateDocumentRequest  $request  Validated request with optional title and folder
     * @param  Document  $document  Document to duplicate (resolved by route model binding)
     * @return JsonResponse JSON response with duplicated document data
     *
     * @api POST /api/documents/{id}/duplicate
     *
     * @apiParam {string} id Document unique ID to duplicate
     *
     * @apiBody {string} [title] Optional. Custom title for the duplicate
     * @apiBody {int} [folder_id] Optional. Folder to place duplicate in
     *
     * @apiSuccess (201) {object} data New document object
     * @apiSuccess (201) {string} message Success message
     *
     * @apiError (404) Document not found or user lacks permission
     */
    public function duplicate(DuplicateDocumentRequest $request, Document $document): JsonResponse
    {
        $user = Auth::user();

        // Ensure the document belongs to the user
        if ($document->user_id !== $user->id) {
            return response()->json([
                'message' => 'Document not found',
            ], 404);
        }

        $validated = $request->validated();

        $duplicatedDocument = $this->documentService->duplicateDocument(
            $document,
            $user,
            $validated
        );

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
                'updated_at' => $duplicatedDocument->updated_at,
            ],
            'message' => 'Document duplicated successfully',
        ], 201);
    }

    /**
     * Soft delete a document.
     *
     * Soft delete a document using Laravel's built-in SoftDeletes functionality.
     * This is a soft delete operation - the document can be restored later.
     *
     * @param  string  $document  Document ID to delete
     * @return JsonResponse JSON response with success message
     *
     * @api DELETE /api/documents/{id}
     *
     * @apiParam {string} id Document unique ID
     *
     * @apiSuccess (200) {string} message Success message
     *
     * @apiError (404) Document not found or user lacks permission
     */
    public function destroy(string $document): JsonResponse
    {
        $user = Auth::user();

        $doc = Document::where('id', $document)
            ->where('user_id', $user->id)
            ->first();

        if (! $doc) {
            return response()->json(['message' => 'Document not found'], 404);
        }

        $this->documentService->deleteDocument($doc, $user);

        return response()->json([
            'message' => 'Document moved to trash successfully',
        ]);
    }

    /**
     * Get all trashed documents for the authenticated user.
     *
     * Returns a paginated list of soft-deleted documents that can be restored.
     * Documents are automatically permanently deleted after 30 days.
     *
     * @return JsonResponse JSON response with paginated trashed documents
     *
     * @api GET /api/collections/trash
     *
     * @apiQuery {int} [page=1] Page number for pagination
     * @apiQuery {int} [per_page=10] Items per page (max 100)
     *
     * @apiSuccess (200) {array} data Array of trashed document objects
     * @apiSuccess (200) {object} meta Pagination metadata
     */
    public function getTrashed(): JsonResponse
    {
        $user = Auth::user();
        $perPage = request()->input('per_page', 10);

        $documents = Document::onlyTrashed()
            ->where('user_id', $user->id)
            ->with('folder:id,name,path')
            ->orderBy('deleted_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'title' => $doc->title,
                    'slug' => $doc->slug,
                    'folder_id' => $doc->folder_id,
                    'folder_name' => $doc->folder?->name,
                    'folder_path' => $doc->folder?->path,
                    'word_count' => $doc->word_count,
                    'character_count' => $doc->character_count,
                    'size' => $doc->size,
                    'version_number' => $doc->version_number,
                    'is_favorite' => $doc->is_favorite,
                    'is_archived' => $doc->is_archived,
                    'tags' => $doc->tags,
                    'status' => $doc->status,
                    'deleted_at' => $doc->deleted_at,
                    'days_until_permanent_deletion' => max(0, 30 - floor($doc->deleted_at->diffInDays(now()))),
                    'created_at' => $doc->created_at,
                    'updated_at' => $doc->updated_at,
                ];
            }),
            'meta' => [
                'current_page' => $documents->currentPage(),
                'last_page' => $documents->lastPage(),
                'per_page' => $documents->perPage(),
                'total' => $documents->total(),
            ],
        ]);
    }

    /**
     * Restore a soft-deleted document.
     *
     * Restores a document from trash, making it accessible again.
     *
     * @param  string  $document  Document ID to restore
     * @return JsonResponse JSON response with success message
     *
     * @api POST /api/documents/{id}/restore
     *
     * @apiParam {string} id Document unique ID
     *
     * @apiSuccess (200) {string} message Success message
     * @apiSuccess (200) {object} data Restored document data
     *
     * @apiError (404) Document not found in trash
     */
    public function restore(string $document): JsonResponse
    {
        $user = Auth::user();

        $doc = Document::onlyTrashed()
            ->where('id', $document)
            ->where('user_id', $user->id)
            ->first();

        if (! $doc) {
            return response()->json(['message' => 'Document not found in trash'], 404);
        }

        $doc->restore();

        return response()->json([
            'message' => 'Document restored successfully',
            'data' => [
                'id' => $doc->id,
                'title' => $doc->title,
                'folder_id' => $doc->folder_id,
            ],
        ]);
    }

    /**
     * Permanently delete a soft-deleted document.
     *
     * Permanently removes a document from the database. This action cannot be undone.
     *
     * @param  string  $document  Document ID to permanently delete
     * @return JsonResponse JSON response with success message
     *
     * @api DELETE /api/documents/{id}/force
     *
     * @apiParam {string} id Document unique ID
     *
     * @apiSuccess (200) {string} message Success message
     *
     * @apiError (404) Document not found in trash
     */
    public function forceDelete(string $document): JsonResponse
    {
        $user = Auth::user();

        $doc = Document::onlyTrashed()
            ->where('id', $document)
            ->where('user_id', $user->id)
            ->first();

        if (! $doc) {
            return response()->json(['message' => 'Document not found in trash'], 404);
        }

        // Also delete related versions
        $doc->versions()->delete();
        $doc->forceDelete();

        return response()->json([
            'message' => 'Document permanently deleted',
        ]);
    }
}
