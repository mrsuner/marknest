<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Folder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Folder>
 */
class FolderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->words(rand(1, 3), true);
        $slug = Str::slug($name);
        
        return [
            'name' => $name,
            'slug' => $slug,
            'description' => fake()->optional()->sentence(),
            'user_id' => User::factory(),
            'parent_id' => null,
            'path' => '/' . $slug,
            'depth' => 0,
            'order' => fake()->numberBetween(0, 100),
            'color' => fake()->optional()->hexColor(),
            'icon' => fake()->optional()->randomElement(['folder', 'book', 'star', 'heart', 'briefcase']),
        ];
    }

    public function withParent(Folder $parent): static
    {
        return $this->state(function (array $attributes) use ($parent) {
            $slug = Str::slug($attributes['name']);
            return [
                'parent_id' => $parent->id,
                'user_id' => $parent->user_id,
                'path' => $parent->path . '/' . $slug,
                'depth' => $parent->depth + 1,
            ];
        });
    }

    public function rootFolder(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => null,
            'depth' => 0,
            'path' => '/' . Str::slug($attributes['name']),
        ]);
    }
}