<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use SoftDeletes;
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'rendered_html',
        'user_id',
        'folder_id',
        'size',
        'word_count',
        'character_count',
        'version_number',
        'is_favorite',
        'is_archived',
        'is_trashed',
        'trashed_at',
        'tags',
        'metadata',
        'status',
        'last_accessed_at',
    ];

    protected $casts = [
        'size' => 'integer',
        'word_count' => 'integer',
        'character_count' => 'integer',
        'version_number' => 'integer',
        'is_favorite' => 'boolean',
        'is_archived' => 'boolean',
        'is_trashed' => 'boolean',
        'trashed_at' => 'datetime',
        'tags' => 'array',
        'metadata' => 'array',
        'last_accessed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(Folder::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(DocumentVersion::class)->orderBy('version_number', 'desc');
    }

    public function shares(): HasMany
    {
        return $this->hasMany(DocumentShare::class);
    }

    public function collaborators(): HasMany
    {
        return $this->hasMany(DocumentCollaborator::class);
    }

    public function mediaFiles(): BelongsToMany
    {
        return $this->belongsToMany(MediaFile::class, 'document_media')
                    ->withPivot(['usage_context', 'order', 'metadata'])
                    ->withTimestamps()
                    ->orderBy('document_media.order');
    }

    public function exportJobs(): HasMany
    {
        return $this->hasMany(ExportJob::class);
    }

    public function scopeFavorites($query)
    {
        return $query->where('is_favorite', true);
    }

    public function scopeArchived($query)
    {
        return $query->where('is_archived', true);
    }

    public function scopeTrashed($query)
    {
        return $query->where('is_trashed', true);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}