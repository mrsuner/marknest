<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Folder;
use App\Models\User;
use Illuminate\Database\Seeder;

class DocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::with('folders')->get()->each(function ($user) {
            // Create documents in folders
            $user->folders->each(function ($folder) {
                Document::factory(rand(2, 5))->withFolder($folder)->create();
            });

            // Create some root-level documents (no folder)
            Document::factory(3)->create([
                'user_id' => $user->id,
                'folder_id' => null,
            ]);

            // Create some special documents
            Document::factory(1)->favorite()->create([
                'user_id' => $user->id,
            ]);

            Document::factory(1)->archived()->create([
                'user_id' => $user->id,
            ]);
        });

        // Create some demo documents with specific content
        $demoUser = User::where('email', 'demo@example.com')->first();
        if ($demoUser) {
            $projectsFolder = $demoUser->folders()->where('slug', 'projects')->first();

            if ($projectsFolder) {
                Document::factory()->create([
                    'user_id' => $demoUser->id,
                    'folder_id' => $projectsFolder->id,
                    'title' => 'Project Roadmap',
                    'content' => "# Project Roadmap\n\n## Q1 Goals\n- [ ] Complete MVP\n- [ ] User testing\n- [ ] Launch preparation\n\n## Q2 Goals\n- [ ] Feature expansion\n- [ ] Mobile app\n- [ ] Analytics dashboard",
                    'status' => 'published',
                    'is_favorite' => true,
                ]);
            }

            Document::factory()->create([
                'user_id' => $demoUser->id,
                'title' => 'Getting Started Guide',
                'content' => "# Welcome to Marknest!\n\nThis is your first document. Here's what you can do:\n\n- Write in **Markdown**\n- Organize with folders\n- Share with others\n- Export to various formats\n\n## Features\n- Real-time preview\n- Version history\n- Collaborative editing\n- File attachments",
                'status' => 'published',
            ]);
        }
    }
}
