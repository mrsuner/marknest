<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Folder;
use Illuminate\Database\Seeder;

class FolderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::all()->each(function ($user) {
            // Create root folders for each user
            $rootFolders = Folder::factory(3)->rootFolder()->create([
                'user_id' => $user->id,
            ]);

            // Create subfolders
            $rootFolders->each(function ($rootFolder) {
                $subfolders = Folder::factory(2)->withParent($rootFolder)->create();
                
                // Create nested subfolders
                $subfolders->each(function ($subfolder) {
                    Folder::factory(1)->withParent($subfolder)->create();
                });
            });
        });

        // Create some common folder structures
        $demoUser = User::where('email', 'demo@example.com')->first();
        if ($demoUser) {
            $projectsFolder = Folder::factory()->create([
                'user_id' => $demoUser->id,
                'name' => 'Projects',
                'slug' => 'projects',
                'path' => '/projects',
                'depth' => 0,
                'color' => '#3B82F6',
                'icon' => 'briefcase',
            ]);

            $notesFolder = Folder::factory()->create([
                'user_id' => $demoUser->id,
                'name' => 'Notes',
                'slug' => 'notes',
                'path' => '/notes',
                'depth' => 0,
                'color' => '#10B981',
                'icon' => 'book',
            ]);
        }
    }
}