<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserActivity>
 */
class UserActivityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $activityType = fake()->randomElement([
            'login', 'logout', 'document_create', 'document_update', 'document_delete',
            'folder_create', 'folder_update', 'folder_delete', 'share_create', 'export_request'
        ]);
        
        $entityType = $this->getEntityTypeForActivity($activityType);
        
        return [
            'user_id' => User::factory(),
            'activity_type' => $activityType,
            'entity_type' => $entityType,
            'entity_id' => $entityType ? fake()->numberBetween(1, 1000) : null,
            'description' => $this->getDescriptionForActivity($activityType),
            'metadata' => $this->getMetadataForActivity($activityType),
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'created_at' => fake()->dateTimeBetween('-6 months', 'now'),
        ];
    }

    private function getEntityTypeForActivity(string $activityType): ?string
    {
        return match ($activityType) {
            'document_create', 'document_update', 'document_delete' => 'document',
            'folder_create', 'folder_update', 'folder_delete' => 'folder',
            'share_create' => 'share',
            'export_request' => 'export',
            default => null,
        };
    }

    private function getDescriptionForActivity(string $activityType): string
    {
        return match ($activityType) {
            'login' => 'User logged in',
            'logout' => 'User logged out',
            'document_create' => 'Created a new document',
            'document_update' => 'Updated document content',
            'document_delete' => 'Deleted a document',
            'folder_create' => 'Created a new folder',
            'folder_update' => 'Updated folder settings',
            'folder_delete' => 'Deleted a folder',
            'share_create' => 'Created a document share link',
            'export_request' => 'Requested document export',
            default => fake()->sentence(),
        };
    }

    private function getMetadataForActivity(string $activityType): array
    {
        return match ($activityType) {
            'login', 'logout' => [
                'session_id' => fake()->uuid(),
                'remember_me' => fake()->boolean(),
            ],
            'document_create', 'document_update' => [
                'word_count' => fake()->numberBetween(10, 5000),
                'editor_version' => '1.0.0',
            ],
            'export_request' => [
                'format' => fake()->randomElement(['pdf', 'docx', 'html']),
                'options' => ['include_toc' => fake()->boolean()],
            ],
            default => [],
        };
    }

    public function login(): static
    {
        return $this->state(fn (array $attributes) => [
            'activity_type' => 'login',
            'entity_type' => null,
            'entity_id' => null,
            'description' => 'User logged in',
        ]);
    }

    public function documentActivity(): static
    {
        return $this->state(fn (array $attributes) => [
            'activity_type' => fake()->randomElement(['document_create', 'document_update', 'document_delete']),
            'entity_type' => 'document',
            'entity_id' => fake()->numberBetween(1, 1000),
        ]);
    }
}