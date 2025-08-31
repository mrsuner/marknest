<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentShare extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'user_id',
        'share_token',
        'short_url',
        'password',
        'expires_at',
        'max_views',
        'view_count',
        'allow_download',
        'allow_copy',
        'show_watermark',
        'access_level',
        'allowed_emails',
        'access_log',
        'is_active',
        'description',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'max_views' => 'integer',
        'view_count' => 'integer',
        'allow_download' => 'boolean',
        'allow_copy' => 'boolean',
        'show_watermark' => 'boolean',
        'allowed_emails' => 'array',
        'access_log' => 'array',
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'password',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
        });
    }
}