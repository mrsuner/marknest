<?php

namespace Database\Factories;

use App\Models\ApiKey;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ApiKey>
 */
class ApiKeyFactory extends Factory
{
    protected $model = ApiKey::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement(['Chrome on macOS', 'VSCode', 'CLI Script']),
            'token' => hash('sha256', Str::random(40)),
            'abilities' => ['read', 'write'],
            'last_used_at' => null,
            'expires_at' => null,
        ];
    }
}
