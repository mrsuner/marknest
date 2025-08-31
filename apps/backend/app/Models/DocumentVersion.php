<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentVersion extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'document_id',
        'user_id',
        'version_number',
        'title',
        'content',
        'rendered_html',
        'size',
        'word_count',
        'character_count',
        'change_summary',
        'diff',
        'operation',
        'is_auto_save',
        'created_at',
    ];

    protected $casts = [
        'version_number' => 'integer',
        'size' => 'integer',
        'word_count' => 'integer',
        'character_count' => 'integer',
        'diff' => 'array',
        'is_auto_save' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}