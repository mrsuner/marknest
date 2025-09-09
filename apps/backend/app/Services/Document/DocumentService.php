<?php

namespace App\Services\Document;

use App\Models\Document;
use App\Models\DocumentVersion;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DocumentService
{
    /**
     * Create a new document with initial version
     *
     * @param  array  $data  Document data
     * @param  User  $user  Document owner
     * @return Document Created document
     */
    public function createDocument(array $data, User $user): Document
    {
        $content = $data['content'] ?? '';

        return DB::transaction(function () use ($data, $user, $content) {
            // Validate folder ownership if provided
            if (isset($data['folder_id']) && $data['folder_id']) {
                $user->folders()->findOrFail($data['folder_id']);
            }

            $doc = Document::create([
                'title' => $data['title'],
                'slug' => '', // Will be set to ID after creation
                'content' => $content,
                'rendered_html' => $this->renderMarkdown($content),
                'user_id' => $user->id,
                'folder_id' => $data['folder_id'] ?? null,
                'size' => strlen($content),
                'word_count' => str_word_count(strip_tags($content)),
                'character_count' => strlen($content),
                'version_number' => 1,
                'tags' => $data['tags'] ?? [],
                'status' => $data['status'] ?? 'draft',
                'last_accessed_at' => now(),
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
                'created_at' => now(),
            ]);

            return $doc;
        });
    }

    /**
     * Update document with versioning
     *
     * @param  Document  $document  Document to update
     * @param  array  $data  Update data
     * @param  User  $user  User performing update
     * @return Document Updated document
     */
    public function updateDocument(Document $document, array $data, User $user): Document
    {
        return DB::transaction(function () use ($document, $data, $user) {
            $oldContent = $document->content;
            $oldTitle = $document->title;

            // Prepare update data
            $updateData = [];

            if (isset($data['title'])) {
                $updateData['title'] = $data['title'];
                $updateData['slug'] = Str::slug($data['title']);
            }

            if (isset($data['content'])) {
                $updateData['content'] = $data['content'];
                $updateData['word_count'] = str_word_count(strip_tags($data['content']));
                $updateData['character_count'] = strlen($data['content']);
                $updateData['size'] = strlen($data['content']);
                $updateData['rendered_html'] = $this->renderMarkdown($data['content']);
            }

            if (isset($data['folder_id'])) {
                // Validate folder belongs to user
                if ($data['folder_id']) {
                    $user->folders()->findOrFail($data['folder_id']);
                }
                $updateData['folder_id'] = $data['folder_id'];
            }

            if (isset($data['tags'])) {
                $updateData['tags'] = $data['tags'];
            }

            if (isset($data['status'])) {
                $updateData['status'] = $data['status'];
            }

            // Create version if content or title changed
            if (isset($data['content']) || isset($data['title'])) {
                // Get the highest version number for this document
                $maxVersion = DocumentVersion::where('document_id', $document->id)
                    ->max('version_number') ?? 0;
                $versionNumber = $maxVersion + 1;
                $updateData['version_number'] = $versionNumber;

                // Create version entry
                DocumentVersion::create([
                    'document_id' => $document->id,
                    'user_id' => $user->id,
                    'version_number' => $versionNumber,
                    'title' => $data['title'] ?? $oldTitle,
                    'content' => $data['content'] ?? $oldContent,
                    'rendered_html' => $updateData['rendered_html'] ?? $document->rendered_html,
                    'size' => $updateData['size'] ?? $document->size,
                    'word_count' => $updateData['word_count'] ?? $document->word_count,
                    'character_count' => $updateData['character_count'] ?? $document->character_count,
                    'change_summary' => $data['change_summary'] ?? 'Document updated',
                    'operation' => 'update',
                    'is_auto_save' => $data['is_auto_save'] ?? false,
                    'created_at' => now(),
                ]);
            }

            $document->update($updateData);

            return $document;
        });
    }

    /**
     * Get document with access validation
     *
     * @param  string  $documentId  Document ID
     * @param  User  $user  User requesting access
     * @return Document|null Document if found and accessible
     */
    public function getDocument(string $documentId, User $user): ?Document
    {
        $doc = Document::where('id', $documentId)
            ->where('user_id', $user->id)
            ->with(['folder', 'versions' => function ($query) {
                $query->orderBy('version_number', 'desc')->limit(5);
            }])
            ->first();

        if ($doc) {
            // Update last accessed timestamp
            $doc->update(['last_accessed_at' => now()]);
        }

        return $doc;
    }

    /**
     * Get recent documents for user
     *
     * @param  User  $user  Document owner
     * @param  array  $filters  Filter options
     * @return LengthAwarePaginator Paginated documents
     */
    public function getRecentDocuments(User $user, array $filters = []): LengthAwarePaginator
    {
        $perPage = $filters['per_page'] ?? 9;
        $search = $filters['search'] ?? null;
        $sortBy = $filters['sort_by'] ?? 'updated_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';

        $query = Document::where('user_id', $user->id)
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

        return $query->paginate($perPage);
    }

    /**
     * Duplicate a document
     *
     * @param  Document  $document  Original document
     * @param  User  $user  User creating duplicate
     * @param  array  $options  Options for duplication
     * @return Document Duplicated document
     */
    public function duplicateDocument(Document $document, User $user, array $options = []): Document
    {
        // Generate new title
        $newTitle = $options['title'] ?? 'Copy of '.$document->title;

        // Use provided folder_id or keep the same as original
        $folderId = $options['folder_id'] ?? $document->folder_id;

        // Validate folder belongs to user if provided
        if ($folderId) {
            $user->folders()->findOrFail($folderId);
        }

        return DB::transaction(function () use ($document, $user, $newTitle, $folderId) {
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
                'last_accessed_at' => now(),
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
                'change_summary' => 'Duplicated from document: '.$document->title,
                'operation' => 'create',
                'is_auto_save' => false,
                'created_at' => now(),
            ]);

            return $duplicate;
        });
    }

    /**
     * Soft delete a document
     *
     * @param  Document  $document  Document to delete
     * @param  User  $user  User performing the deletion
     * @return bool True if deletion was successful
     */
    public function deleteDocument(Document $document, User $user): bool
    {
        return DB::transaction(function () use ($document, $user) {
            // Use Laravel's built-in soft delete
            return $document->delete();
        });
    }

    /**
     * Render markdown content to HTML
     * TODO: Implement actual markdown rendering
     *
     * @param  string  $content  Markdown content
     * @return string Rendered HTML
     */
    private function renderMarkdown(string $content): string
    {
        // TODO: Implement markdown rendering
        // For now, return content as-is
        return $content;
    }
}
