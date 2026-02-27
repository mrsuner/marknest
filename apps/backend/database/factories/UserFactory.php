<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $plan = fake()->randomElement(['free', 'pro', 'max']);

        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'avatar_url' => fake()->optional(0.3)->imageUrl(200, 200, 'people'),
            'bio' => fake()->optional(0.5)->realText(150),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'plan' => $plan,
            'storage_used' => fake()->numberBetween(0, 5000000), // 0-5MB default for Free
            'storage_limit' => $this->getStorageLimit($plan),
            'document_count' => fake()->numberBetween(0, 50),
            'document_limit' => $this->getDocumentLimit($plan),
            'links_count' => fake()->numberBetween(0, 10),
            'links_limit' => $this->getLinksLimit($plan),
            'version_limit' => $this->getVersionLimit($plan),
            'can_share_public' => $plan !== 'free',
            'can_password_protect' => $plan !== 'free',
        ];
    }

    private function getStorageLimit(string $plan): int
    {
        return match ($plan) {
            'free' => 20 * 1024 * 1024, // 20MB
            'pro' => 1024 * 1024 * 1024, // 1GB
            'max' => 10 * 1024 * 1024 * 1024, // 10GB
        };
    }

    private function getDocumentLimit(string $plan): int
    {
        return match ($plan) {
            'free' => 100,
            'pro' => 5000,
            'max' => 1000000, // effectively unlimited
        };
    }

    private function getLinksLimit(string $plan): int
    {
        return match ($plan) {
            'free' => 0,
            'pro' => 100,
            'max' => 1000,
        };
    }

    private function getVersionLimit(string $plan): int
    {
        return match ($plan) {
            'free' => 10,
            'pro' => 100,
            'max' => 100,
        };
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
