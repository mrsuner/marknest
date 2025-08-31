<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DocumentShare>
 */
class DocumentShareFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'document_id' => Document::factory(),
            'user_id' => User::factory(),
            'share_token' => Str::random(64),
            'short_url' => Str::random(8),
            'password' => fake()->optional()->password(),
            'expires_at' => fake()->optional()->dateTimeBetween('now', '+1 year'),
            'max_views' => fake()->optional()->numberBetween(1, 1000),
            'view_count' => fake()->numberBetween(0, 100),
            'allow_download' => fake()->boolean(),
            'allow_copy' => fake()->boolean(),
            'show_watermark' => fake()->boolean(30),
            'access_level' => fake()->randomElement(['read', 'comment', 'edit']),
            'allowed_emails' => fake()->optional()->randomElements([
                fake()->email(), fake()->email(), fake()->email()
            ], rand(1, 3)),
            'access_log' => [],
            'is_active' => true,
            'description' => fake()->optional()->sentence(),
        ];
    }

    public function withPassword(): static
    {
        return $this->state(fn (array $attributes) => [
            'password' => bcrypt('sharepassword'),
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => fake()->dateTimeBetween('-1 year', 'yesterday'),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}