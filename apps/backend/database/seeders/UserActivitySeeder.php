<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Document;
use App\Models\Folder;
use App\Models\UserActivity;
use Illuminate\Database\Seeder;

class UserActivitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        // Create login/logout activities for all users
        $users->each(function ($user) {
            // Recent login activities
            UserActivity::factory(rand(5, 15))->login()->create([
                'user_id' => $user->id,
                'created_at' => fake()->dateTimeBetween('-30 days', 'now'),
            ]);

            // Document activities
            $user->documents()->each(function ($document) use ($user) {
                // Document creation activity
                UserActivity::factory()->create([
                    'user_id' => $user->id,
                    'activity_type' => 'document_create',
                    'entity_type' => 'document',
                    'entity_id' => $document->id,
                    'description' => "Created document '{$document->title}'",
                    'created_at' => $document->created_at,
                ]);

                // Some document update activities
                if (rand(1, 100) <= 60) { // 60% chance
                    UserActivity::factory(rand(1, 5))->create([
                        'user_id' => $user->id,
                        'activity_type' => 'document_update',
                        'entity_type' => 'document',
                        'entity_id' => $document->id,
                        'description' => "Updated document '{$document->title}'",
                        'created_at' => fake()->dateTimeBetween($document->created_at, 'now'),
                    ]);
                }
            });

            // Folder activities
            $user->folders()->each(function ($folder) use ($user) {
                UserActivity::factory()->create([
                    'user_id' => $user->id,
                    'activity_type' => 'folder_create',
                    'entity_type' => 'folder',
                    'entity_id' => $folder->id,
                    'description' => "Created folder '{$folder->name}'",
                    'created_at' => $folder->created_at,
                ]);
            });

            // Share activities
            $user->documentShares()->each(function ($share) use ($user) {
                UserActivity::factory()->create([
                    'user_id' => $user->id,
                    'activity_type' => 'share_create',
                    'entity_type' => 'share',
                    'entity_id' => $share->id,
                    'description' => "Created share link for document",
                    'created_at' => $share->created_at,
                ]);
            });

            // Export activities
            $user->exportJobs()->each(function ($exportJob) use ($user) {
                UserActivity::factory()->create([
                    'user_id' => $user->id,
                    'activity_type' => 'export_request',
                    'entity_type' => 'export',
                    'entity_id' => $exportJob->id,
                    'description' => "Requested {$exportJob->format} export",
                    'created_at' => $exportJob->created_at,
                ]);
            });
        });

        // Create some additional random activities for variety
        UserActivity::factory(100)->documentActivity()->create();

        // Create recent activity for demo purposes
        $recentUsers = User::limit(5)->get();
        $recentUsers->each(function ($user) {
            UserActivity::factory(10)->create([
                'user_id' => $user->id,
                'created_at' => fake()->dateTimeBetween('-7 days', 'now'),
            ]);
        });
    }
}