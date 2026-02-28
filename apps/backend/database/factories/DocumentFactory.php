<?php

namespace Database\Factories;

use App\Models\Folder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Document>
 */
class DocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(rand(2, 6), false);
        $content = fake()->paragraphs(rand(3, 10), true);
        $wordCount = str_word_count($content);
        $characterCount = strlen($content);
        $size = strlen($content);

        return [
            'title' => rtrim($title, '.'),
            'slug' => Str::slug($title),
            'content' => $content,
            'rendered_html' => '<p>'.str_replace("\n\n", '</p><p>', $content).'</p>',
            'user_id' => User::factory(),
            'folder_id' => null,
            'size' => $size,
            'word_count' => $wordCount,
            'character_count' => $characterCount,
            'version_number' => 1,
            'is_favorite' => fake()->boolean(20),
            'is_archived' => fake()->boolean(10),
            'metadata' => [
                'created_from' => fake()->randomElement(['web', 'mobile', 'api']),
                'editor_version' => '1.0.0',
            ],
            'status' => fake()->randomElement(['draft', 'published', 'private']),
            'last_accessed_at' => fake()->dateTimeBetween('-1 month', 'now'),
        ];
    }

    public function favorite(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_favorite' => true,
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_archived' => true,
        ]);
    }

    public function trashed(): static
    {
        return $this->state(fn (array $attributes) => [
            'deleted_at' => now(),
        ]);
    }

    public function withFolder(Folder $folder): static
    {
        return $this->state(fn (array $attributes) => [
            'folder_id' => $folder->id,
            'user_id' => $folder->user_id,
        ]);
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
        ]);
    }
}
