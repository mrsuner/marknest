<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Document;
use App\Models\DocumentCollaborator;
use Illuminate\Database\Seeder;

class DocumentCollaboratorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $documents = Document::with('user')->get();

        // Create collaborative relationships between users
        $documents->each(function ($document) use ($users) {
            if (rand(1, 100) <= 30) { // 30% chance for collaboration
                $otherUsers = $users->where('id', '!=', $document->user_id);
                $collaborators = $otherUsers->random(rand(1, 3));

                $collaborators->each(function ($collaborator) use ($document) {
                    if (!DocumentCollaborator::where('document_id', $document->id)
                                            ->where('user_id', $collaborator->id)
                                            ->exists()) {
                        DocumentCollaborator::factory()->create([
                            'document_id' => $document->id,
                            'user_id' => $collaborator->id,
                            'invited_by' => $document->user_id,
                            'permission' => fake()->randomElement(['view', 'comment', 'edit']),
                        ]);
                    }
                });
            }
        });

        // Create some specific collaboration scenarios
        $adminUser = User::where('email', 'admin@marknest.com')->first();
        $testUser = User::where('email', 'test@example.com')->first();
        $demoUser = User::where('email', 'demo@example.com')->first();

        if ($adminUser && $testUser) {
            $adminDocuments = $adminUser->documents()->limit(2)->get();
            $adminDocuments->each(function ($document) use ($testUser, $adminUser) {
                if (!DocumentCollaborator::where('document_id', $document->id)
                                        ->where('user_id', $testUser->id)
                                        ->exists()) {
                    DocumentCollaborator::factory()->editor()->create([
                        'document_id' => $document->id,
                        'user_id' => $testUser->id,
                        'invited_by' => $adminUser->id,
                    ]);
                }
            });
        }

        if ($demoUser && $testUser) {
            $demoDocuments = $demoUser->documents()->limit(1)->get();
            $demoDocuments->each(function ($document) use ($testUser, $demoUser) {
                if (!DocumentCollaborator::where('document_id', $document->id)
                                        ->where('user_id', $testUser->id)
                                        ->exists()) {
                    DocumentCollaborator::factory()->viewer()->create([
                        'document_id' => $document->id,
                        'user_id' => $testUser->id,
                        'invited_by' => $demoUser->id,
                    ]);
                }
            });
        }
    }
}