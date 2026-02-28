<?php

namespace App\Services\Document;

use App\Models\Document;
use App\Models\DocumentVersion;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class DocumentVersionService
{
    /**
     * Get paginated versions for a document
     *
     * @param  Document  $document  Document to get versions for
     * @param  int  $perPage  Items per page
     * @return LengthAwarePaginator Paginated versions
     */
    public function getVersions(Document $document, int $perPage = 10): LengthAwarePaginator
    {
        return DocumentVersion::where('document_id', $document->id)
            ->with('user:id,name,email')
            ->orderBy('version_number', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get a specific version of a document
     *
     * @param  Document  $document  Parent document
     * @param  string  $versionId  Version ID
     * @return DocumentVersion|null Version if found
     */
    public function getVersion(Document $document, string $versionId): ?DocumentVersion
    {
        return DocumentVersion::where('id', $versionId)
            ->where('document_id', $document->id)
            ->with('user:id,name,email')
            ->first();
    }

    /**
     * Restore a document to a specific version
     *
     * @param  Document  $document  Document to restore
     * @param  DocumentVersion  $version  Version to restore to
     * @param  User  $user  User performing restoration
     * @param  string|null  $changeSummary  Optional change summary
     * @return Document Updated document
     */
    public function restoreVersion(
        Document $document,
        DocumentVersion $version,
        User $user,
        ?string $changeSummary = null
    ): Document {
        return DB::transaction(function () use ($document, $version, $user, $changeSummary) {
            // Get the highest version number
            $maxVersion = DocumentVersion::where('document_id', $document->id)
                ->max('version_number') ?? 0;
            $newVersionNumber = $maxVersion + 1;

            // Update the document with the restored version's content
            $document->update([
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
                'document_id' => $document->id,
                'user_id' => $user->id,
                'version_number' => $newVersionNumber,
                'title' => $version->title,
                'content' => $version->content,
                'rendered_html' => $version->rendered_html,
                'size' => $version->size,
                'word_count' => $version->word_count,
                'character_count' => $version->character_count,
                'change_summary' => $changeSummary ?? "Restored from version {$version->version_number}",
                'operation' => 'restore',
                'is_auto_save' => false,
                'created_at' => now(),
            ]);

            return $document;
        });
    }

    /**
     * Create a new version for a document
     *
     * @param  Document  $document  Parent document
     * @param  User  $user  User creating version
     * @param  array  $data  Version data
     * @return DocumentVersion Created version
     */
    public function createVersion(Document $document, User $user, array $data): DocumentVersion
    {
        // Get the highest version number
        $maxVersion = DocumentVersion::where('document_id', $document->id)
            ->max('version_number') ?? 0;
        $versionNumber = $maxVersion + 1;

        return DocumentVersion::create([
            'document_id' => $document->id,
            'user_id' => $user->id,
            'version_number' => $versionNumber,
            'title' => $data['title'] ?? $document->title,
            'content' => $data['content'] ?? $document->content,
            'rendered_html' => $data['rendered_html'] ?? $document->rendered_html,
            'size' => $data['size'] ?? $document->size,
            'word_count' => $data['word_count'] ?? $document->word_count,
            'character_count' => $data['character_count'] ?? $document->character_count,
            'change_summary' => $data['change_summary'] ?? 'Version created',
            'operation' => $data['operation'] ?? 'update',
            'is_auto_save' => $data['is_auto_save'] ?? false,
            'created_at' => now(),
        ]);
    }

    /**
     * Get recent versions for a document
     *
     * @param  Document  $document  Parent document
     * @param  int  $limit  Number of versions to retrieve
     * @return \Illuminate\Database\Eloquent\Collection Recent versions
     */
    public function getRecentVersions(Document $document, int $limit = 5)
    {
        return DocumentVersion::where('document_id', $document->id)
            ->with('user:id,name,email')
            ->orderBy('version_number', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Delete old auto-save versions
     *
     * @param  Document  $document  Parent document
     * @param  int  $keepCount  Number of auto-saves to keep
     * @return int Number of deleted versions
     */
    public function cleanupAutoSaves(Document $document, int $keepCount = 5): int
    {
        $autoSaveIds = DocumentVersion::where('document_id', $document->id)
            ->where('is_auto_save', true)
            ->orderBy('version_number', 'desc')
            ->skip($keepCount)
            ->pluck('id');

        return DocumentVersion::whereIn('id', $autoSaveIds)->delete();
    }

    /**
     * Compare two versions and generate diff
     *
     * @param  DocumentVersion  $oldVersion  Old version
     * @param  DocumentVersion  $newVersion  New version
     * @return array Diff information
     */
    public function compareVersions(DocumentVersion $oldVersion, DocumentVersion $newVersion): array
    {
        return [
            'title_changed' => $oldVersion->title !== $newVersion->title,
            'content_changed' => $oldVersion->content !== $newVersion->content,
            'word_count_diff' => $newVersion->word_count - $oldVersion->word_count,
            'character_count_diff' => $newVersion->character_count - $oldVersion->character_count,
            'old_version' => [
                'version_number' => $oldVersion->version_number,
                'created_at' => $oldVersion->created_at,
                'title' => $oldVersion->title,
            ],
            'new_version' => [
                'version_number' => $newVersion->version_number,
                'created_at' => $newVersion->created_at,
                'title' => $newVersion->title,
            ],
        ];
    }
}
