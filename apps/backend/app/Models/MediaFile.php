<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MediaFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'original_name',
        'filename',
        'mime_type',
        'file_extension',
        'size',
        'disk',
        'path',
        'url',
        'alt_text',
        'description',
        'metadata',
        'hash',
        'is_optimized',
        'is_public',
        'download_count',
        'last_accessed_at',
    ];

    protected $casts = [
        'size' => 'integer',
        'metadata' => 'array',
        'is_optimized' => 'boolean',
        'is_public' => 'boolean',
        'download_count' => 'integer',
        'last_accessed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documents(): BelongsToMany
    {
        return $this->belongsToMany(Document::class, 'document_media')
                    ->withPivot(['usage_context', 'order', 'metadata'])
                    ->withTimestamps()
                    ->orderBy('document_media.order');
    }

    public function scopeImages($query)
    {
        return $query->where('mime_type', 'like', 'image/%');
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}