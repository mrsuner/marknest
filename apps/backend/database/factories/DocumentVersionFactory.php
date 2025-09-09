<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DocumentVersion>
 */
class DocumentVersionFactory extends Factory
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
            'document_id' => Document::factory(),
            'user_id' => User::factory(),
            'version_number' => fake()->numberBetween(1, 10),
            'title' => rtrim($title, '.'),
            'content' => $content,
            'rendered_html' => '<p>'.str_replace("\n\n", '</p><p>', $content).'</p>',
            'size' => $size,
            'word_count' => $wordCount,
            'character_count' => $characterCount,
            'change_summary' => fake()->optional()->sentence(),
            'diff' => fake()->optional()->randomElements(['added', 'removed', 'modified'], rand(1, 3)),
            'operation' => fake()->randomElement(['create', 'update', 'restore']),
            'is_auto_save' => fake()->boolean(30),
            'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }

    public function forDocument(Document $document): static
    {
        return $this->state(fn (array $attributes) => [
            'document_id' => $document->id,
            'user_id' => $document->user_id,
        ]);
    }

    public function autoSave(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_auto_save' => true,
            'operation' => 'update',
        ]);
    }
}
