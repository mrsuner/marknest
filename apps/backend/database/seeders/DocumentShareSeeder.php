<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\DocumentShare;
use Illuminate\Database\Seeder;

class DocumentShareSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create shares for published documents
        $publishedDocuments = Document::where('status', 'published')->get();
        
        $publishedDocuments->each(function ($document) {
            // Only create shares for users who can share publicly
            if ($document->user->can_share_public && rand(1, 100) <= 40) { // 40% chance
                DocumentShare::factory()->create([
                    'document_id' => $document->id,
                    'user_id' => $document->user_id,
                ]);
            }
        });

        // Create some password-protected shares
        $proUsers = Document::whereHas('user', function ($query) {
            $query->where('can_password_protect', true);
        })->limit(5)->get();

        $proUsers->each(function ($document) {
            DocumentShare::factory()->withPassword()->create([
                'document_id' => $document->id,
                'user_id' => $document->user_id,
                'access_level' => 'read',
                'allow_download' => false,
            ]);
        });

        // Create some expired shares
        DocumentShare::factory(3)->expired()->create();

        // Create some inactive shares
        DocumentShare::factory(2)->inactive()->create();
    }
}