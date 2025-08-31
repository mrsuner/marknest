<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Template>
 */
class TemplateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->words(rand(2, 4), true);
        $category = fake()->randomElement(['personal', 'business', 'academic', 'technical']);
        
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'content' => $this->getTemplateContent($category),
            'category' => $category,
            'user_id' => fake()->optional()->passthrough(User::factory()),
            'is_public' => fake()->boolean(30),
            'is_featured' => fake()->boolean(10),
            'usage_count' => fake()->numberBetween(0, 1000),
            'variables' => [
                'title' => '{{title}}',
                'author' => '{{author}}',
                'date' => '{{date}}',
            ],
            'metadata' => [
                'version' => '1.0',
                'tags' => fake()->randomElements(['template', 'markdown', 'document'], rand(1, 3)),
            ],
            'thumbnail_url' => fake()->optional()->imageUrl(400, 300),
        ];
    }

    private function getTemplateContent(string $category): string
    {
        return match ($category) {
            'business' => "# {{title}}\n\n**Date:** {{date}}\n**Author:** {{author}}\n\n## Executive Summary\n\n{{summary}}\n\n## Details\n\n{{content}}",
            'academic' => "# {{title}}\n\n**Author:** {{author}}\n**Date:** {{date}}\n**Institution:** {{institution}}\n\n## Abstract\n\n{{abstract}}\n\n## Introduction\n\n{{introduction}}",
            'technical' => "# {{title}}\n\n**Version:** {{version}}\n**Date:** {{date}}\n\n## Overview\n\n{{overview}}\n\n## Technical Details\n\n{{details}}",
            default => "# {{title}}\n\n**By:** {{author}}\n**Date:** {{date}}\n\n{{content}}",
        };
    }

    public function public(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_public' => true,
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
            'is_public' => true,
        ]);
    }
}