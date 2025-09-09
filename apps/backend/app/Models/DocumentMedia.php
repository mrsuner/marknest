<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\Pivot;

class DocumentMedia extends Pivot
{
    use HasUlids;

    protected $table = 'document_media';

    protected $fillable = [
        'document_id',
        'media_file_id',
        'usage_context',
        'order',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'order' => 'integer',
    ];
}
