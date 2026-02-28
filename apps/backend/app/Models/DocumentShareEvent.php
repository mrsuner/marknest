<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentShareEvent extends Model
{
    use HasFactory, HasUlids;

    public const TYPE_VIEW = 'view';
    public const TYPE_DOWNLOAD = 'download';
    public const TYPE_COPY = 'copy';
    public const TYPE_PASSWORD_FAILED = 'password_failed';

    public $timestamps = false;

    protected $fillable = [
        'document_share_id',
        'event_type',
        'ip_address',
        'user_agent',
        'metadata',
        'created_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    public function share(): BelongsTo
    {
        return $this->belongsTo(DocumentShare::class, 'document_share_id');
    }
}
