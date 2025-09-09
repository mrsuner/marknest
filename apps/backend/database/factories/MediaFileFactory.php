<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MediaFile>
 */
class MediaFileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $mimeType = fake()->randomElement([
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain', 'application/zip',
        ]);
        $extension = $this->getExtensionFromMimeType($mimeType);
        $filename = Str::random(32).'.'.$extension;
        $originalName = fake()->words(2, true).'.'.$extension;
        $size = fake()->numberBetween(1000, 10000000);

        return [
            'user_id' => User::factory(),
            'original_name' => $originalName,
            'filename' => $filename,
            'mime_type' => $mimeType,
            'file_extension' => $extension,
            'size' => $size,
            'disk' => 'public',
            'path' => 'uploads/'.$filename,
            'alt_text' => str_starts_with($mimeType, 'image/') ? fake()->sentence() : null,
            'description' => fake()->optional()->sentence(),
            'metadata' => $this->getMetadataForMimeType($mimeType),
            'hash' => hash('sha256', $filename.time()),
            'is_optimized' => str_starts_with($mimeType, 'image/') ? fake()->boolean() : false,
            'is_public' => fake()->boolean(30),
            'download_count' => fake()->numberBetween(0, 100),
            'last_accessed_at' => fake()->optional()->dateTimeBetween('-1 month', 'now'),
        ];
    }

    private function getExtensionFromMimeType(string $mimeType): string
    {
        return match ($mimeType) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'application/pdf' => 'pdf',
            'text/plain' => 'txt',
            'application/zip' => 'zip',
            default => 'file',
        };
    }

    private function getMetadataForMimeType(string $mimeType): array
    {
        if (str_starts_with($mimeType, 'image/')) {
            return [
                'width' => fake()->numberBetween(100, 4000),
                'height' => fake()->numberBetween(100, 3000),
                'dpi' => fake()->randomElement([72, 150, 300]),
            ];
        }

        return [];
    }

    public function image(): static
    {
        return $this->state(fn (array $attributes) => [
            'mime_type' => fake()->randomElement(['image/jpeg', 'image/png', 'image/gif']),
            'alt_text' => fake()->sentence(),
            'is_optimized' => fake()->boolean(),
            'metadata' => [
                'width' => fake()->numberBetween(100, 4000),
                'height' => fake()->numberBetween(100, 3000),
                'dpi' => fake()->randomElement([72, 150, 300]),
            ],
        ]);
    }

    public function public(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_public' => true,
        ]);
    }
}
