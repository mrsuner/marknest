<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Document;
use App\Models\MediaFile;
use Illuminate\Database\Seeder;

class MediaFileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create media files for each user first
        $users = User::all();
        $allMediaFiles = collect();

        $users->each(function ($user) use ($allMediaFiles) {
            // Create a media library for each user
            $mediaFiles = MediaFile::factory(rand(3, 8))->create([
                'user_id' => $user->id,
            ]);
            
            $allMediaFiles->push(...$mediaFiles);
        });

        // Create some additional public media files
        $publicMediaFiles = MediaFile::factory(10)->image()->public()->create();
        $allMediaFiles->push(...$publicMediaFiles);

        // Now attach media files to documents using the pivot table
        $documents = Document::with('user')->get();
        
        $documents->each(function ($document) use ($allMediaFiles) {
            if (rand(1, 100) <= 40) { // 40% chance
                // Get media files belonging to this user + public files
                $availableMedia = $allMediaFiles->filter(function ($media) use ($document) {
                    return $media->user_id === $document->user_id || $media->is_public;
                });

                if ($availableMedia->isNotEmpty()) {
                    $attachedMedia = $availableMedia->random(rand(1, min(3, $availableMedia->count())));
                    
                    foreach ($attachedMedia as $index => $mediaFile) {
                        $document->mediaFiles()->attach($mediaFile->id, [
                            'usage_context' => fake()->randomElement(['inline', 'attachment', 'cover', 'gallery']),
                            'order' => $index + 1,
                            'metadata' => json_encode([
                                'position' => fake()->optional()->randomElement(['left', 'center', 'right']),
                                'width' => fake()->optional()->numberBetween(100, 800),
                                'alt_override' => fake()->optional()->sentence(),
                            ]),
                        ]);
                    }
                }
            }
        });

        // Create some shared media scenarios - reuse popular media across documents
        $popularMedia = MediaFile::where('is_public', true)->limit(3)->get();
        $randomDocuments = Document::inRandomOrder()->limit(10)->get();
        
        $randomDocuments->each(function ($document) use ($popularMedia) {
            if (rand(1, 100) <= 30) { // 30% chance
                $sharedMedia = $popularMedia->random(1);
                $document->mediaFiles()->syncWithoutDetaching([
                    $sharedMedia->first()->id => [
                        'usage_context' => 'inline',
                        'order' => $document->mediaFiles()->count() + 1,
                        'metadata' => json_encode(['reused' => true]),
                    ]
                ]);
            }
        });

        // Update user storage usage based on media files
        User::all()->each(function ($user) {
            $totalSize = $user->mediaFiles()->sum('size');
            $user->update(['storage_used' => $totalSize]);
        });

        // Update media file usage counts
        MediaFile::all()->each(function ($mediaFile) {
            $usageCount = $mediaFile->documents()->count();
            $mediaFile->update(['download_count' => $usageCount * rand(1, 5)]);
        });
    }
}