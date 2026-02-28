<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserPreference>
 */
class UserPreferenceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'theme' => fake()->randomElement(['light', 'dark', 'auto']),
            'editor_theme' => fake()->randomElement(['default', 'monokai', 'github', 'dracula']),
            'editor_font_family' => fake()->randomElement(['monospace', 'Fira Code', 'Source Code Pro']),
            'editor_font_size' => fake()->numberBetween(12, 18),
            'editor_line_numbers' => fake()->boolean(80),
            'editor_word_wrap' => fake()->boolean(70),
            'editor_auto_save' => fake()->boolean(90),
            'editor_auto_save_interval' => fake()->randomElement([10, 30, 60, 120]),
            'preview_sync_scroll' => fake()->boolean(80),
            'preview_style' => fake()->randomElement(['github', 'material', 'classic']),
            'default_view' => fake()->randomElement(['edit', 'preview', 'split']),
            'enable_vim_mode' => fake()->boolean(20),
            'enable_spell_check' => fake()->boolean(70),
            'language' => fake()->randomElement(['en', 'es', 'fr', 'de']),
            'timezone' => fake()->timezone(),
            'email_notifications' => fake()->boolean(60),
            'notification_settings' => [
                'document_shared' => fake()->boolean(),
                'collaboration_invite' => fake()->boolean(),
                'export_complete' => fake()->boolean(),
            ],
            'keyboard_shortcuts' => [
                'save' => 'Ctrl+S',
                'bold' => 'Ctrl+B',
                'italic' => 'Ctrl+I',
            ],
        ];
    }

    public function darkMode(): static
    {
        return $this->state(fn (array $attributes) => [
            'theme' => 'dark',
            'editor_theme' => 'monokai',
        ]);
    }

    public function vimUser(): static
    {
        return $this->state(fn (array $attributes) => [
            'enable_vim_mode' => true,
        ]);
    }
}
