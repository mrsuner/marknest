<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'user_id',
        'theme',
        'editor_theme',
        'editor_font_family',
        'editor_font_size',
        'editor_line_numbers',
        'editor_word_wrap',
        'editor_auto_save',
        'editor_auto_save_interval',
        'preview_sync_scroll',
        'preview_style',
        'default_view',
        'enable_vim_mode',
        'enable_spell_check',
        'language',
        'timezone',
        'email_notifications',
        'notification_settings',
        'keyboard_shortcuts',
    ];

    protected $casts = [
        'editor_font_size' => 'integer',
        'editor_line_numbers' => 'boolean',
        'editor_word_wrap' => 'boolean',
        'editor_auto_save' => 'boolean',
        'editor_auto_save_interval' => 'integer',
        'preview_sync_scroll' => 'boolean',
        'enable_vim_mode' => 'boolean',
        'enable_spell_check' => 'boolean',
        'email_notifications' => 'boolean',
        'notification_settings' => 'array',
        'keyboard_shortcuts' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
