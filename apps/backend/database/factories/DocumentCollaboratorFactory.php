<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DocumentCollaborator>
 */
class DocumentCollaboratorFactory extends Factory
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
            'invited_by' => User::factory(),
            'permission' => fake()->randomElement(['view', 'comment', 'edit']),
            'can_share' => fake()->boolean(30),
            'can_delete' => fake()->boolean(10),
            'last_accessed_at' => fake()->optional()->dateTimeBetween('-1 month', 'now'),
        ];
    }

    public function editor(): static
    {
        return $this->state(fn (array $attributes) => [
            'permission' => 'edit',
            'can_share' => true,
        ]);
    }

    public function viewer(): static
    {
        return $this->state(fn (array $attributes) => [
            'permission' => 'view',
            'can_share' => false,
            'can_delete' => false,
        ]);
    }
}