<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UserPreferenceController extends Controller
{
    public function show(): JsonResponse
    {
        $user = Auth::user();
        $preferences = UserPreference::where('user_id', $user->id)->first();

        if (! $preferences) {
            $preferences = UserPreference::create([
                'user_id' => $user->id,
                'theme' => 'paperlight',
                'editor_theme' => 'github-light',
                'editor_font_family' => 'Inter',
                'editor_font_size' => 14,
                'editor_line_numbers' => true,
                'editor_word_wrap' => true,
                'editor_auto_save' => true,
                'editor_auto_save_interval' => 30,
                'preview_sync_scroll' => true,
                'preview_style' => 'github',
                'default_view' => 'editor',
                'enable_vim_mode' => false,
                'enable_spell_check' => true,
                'language' => 'en',
                'timezone' => 'UTC',
                'email_notifications' => true,
                'notification_settings' => [],
                'keyboard_shortcuts' => [],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $preferences,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'theme' => ['nullable', 'string', Rule::in(['paperlight', 'paperdark', 'system'])],
            'editor_theme' => ['nullable', 'string', Rule::in(['github-light', 'github-dark', 'monokai', 'dracula'])],
            'editor_font_family' => ['nullable', 'string', Rule::in(['Inter', 'Roboto', 'Source Code Pro', 'Fira Code', 'Ubuntu Mono'])],
            'editor_font_size' => ['nullable', 'integer', 'min:10', 'max:24'],
            'editor_line_numbers' => ['nullable', 'boolean'],
            'editor_word_wrap' => ['nullable', 'boolean'],
            'editor_auto_save' => ['nullable', 'boolean'],
            'editor_auto_save_interval' => ['nullable', 'integer', 'min:5', 'max:300'],
            'preview_sync_scroll' => ['nullable', 'boolean'],
            'preview_style' => ['nullable', 'string', Rule::in(['github', 'minimal', 'academic', 'modern'])],
            'default_view' => ['nullable', 'string', Rule::in(['editor', 'preview', 'split'])],
            'enable_vim_mode' => ['nullable', 'boolean'],
            'enable_spell_check' => ['nullable', 'boolean'],
            'language' => ['nullable', 'string', Rule::in(['en', 'es', 'fr', 'de'])],
            'timezone' => ['nullable', 'string'],
            'email_notifications' => ['nullable', 'boolean'],
            'notification_settings' => ['nullable', 'array'],
            'keyboard_shortcuts' => ['nullable', 'array'],
        ]);

        $preferences = UserPreference::updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'Preferences updated successfully',
            'data' => $preferences,
        ]);
    }

    public function reset(): JsonResponse
    {
        $user = Auth::user();

        $defaultPreferences = [
            'theme' => 'paperlight',
            'editor_theme' => 'github-light',
            'editor_font_family' => 'Inter',
            'editor_font_size' => 14,
            'editor_line_numbers' => true,
            'editor_word_wrap' => true,
            'editor_auto_save' => true,
            'editor_auto_save_interval' => 30,
            'preview_sync_scroll' => true,
            'preview_style' => 'github',
            'default_view' => 'editor',
            'enable_vim_mode' => false,
            'enable_spell_check' => true,
            'language' => 'en',
            'timezone' => 'UTC',
            'email_notifications' => true,
            'notification_settings' => [],
            'keyboard_shortcuts' => [],
        ];

        $preferences = UserPreference::updateOrCreate(
            ['user_id' => $user->id],
            $defaultPreferences
        );

        return response()->json([
            'success' => true,
            'message' => 'Preferences reset to default',
            'data' => $preferences,
        ]);
    }
}
