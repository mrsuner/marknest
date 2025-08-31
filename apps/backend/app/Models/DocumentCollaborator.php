<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentCollaborator extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'document_id',
        'user_id',
        'invited_by',
        'permission',
        'can_share',
        'can_delete',
        'last_accessed_at',
    ];

    protected $casts = [
        'can_share' => 'boolean',
        'can_delete' => 'boolean',
        'last_accessed_at' => 'datetime',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function scopeByPermission($query, string $permission)
    {
        return $query->where('permission', $permission);
    }
}