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
        $plan = fake()->randomElement(['free', 'pro', 'enterprise']);
        
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'plan' => $plan,
            'storage_used' => fake()->numberBetween(0, 50000000), // 0-50MB
            'storage_limit' => $this->getStorageLimit($plan),
            'document_count' => fake()->numberBetween(0, 25),
            'document_limit' => $this->getDocumentLimit($plan),
            'version_history_days' => $this->getVersionHistoryDays($plan),
            'can_share_public' => $plan !== 'free',
            'can_password_protect' => $plan !== 'free',
        ];
    }

    private function getStorageLimit(string $plan): int
    {
        return match ($plan) {
            'free' => 104857600, // 100MB
            'pro' => 5368709120, // 5GB
            'enterprise' => 53687091200, // 50GB
        };
    }

    private function getDocumentLimit(string $plan): int
    {
        return match ($plan) {
            'free' => 10,
            'pro' => 1000,
            'enterprise' => 10000,
        };
    }

    private function getVersionHistoryDays(string $plan): int
    {
        return match ($plan) {
            'free' => 7,
            'pro' => 30,
            'enterprise' => 365,
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
