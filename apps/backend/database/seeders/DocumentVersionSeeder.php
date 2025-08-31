<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\DocumentVersion;
use Illuminate\Database\Seeder;

class DocumentVersionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create versions for existing documents
        Document::with('user')->get()->each(function ($document) {
            // Create initial version
            DocumentVersion::factory()->create([
                'document_id' => $document->id,
                'user_id' => $document->user_id,
                'version_number' => 1,
                'title' => $document->title,
                'content' => $document->content,
                'rendered_html' => $document->rendered_html,
                'operation' => 'create',
                'created_at' => $document->created_at,
            ]);

            // Create additional versions for some documents
            if (rand(1, 100) <= 70) { // 70% chance
                $versionCount = rand(2, 8);
                
                for ($i = 2; $i <= $versionCount; $i++) {
                    DocumentVersion::factory()->forDocument($document)->create([
                        'version_number' => $i,
                        'operation' => 'update',
                        'created_at' => $document->created_at->addHours($i * 2),
                    ]);
                }
                
                // Update document version number
                $document->update(['version_number' => $versionCount]);
            }
        });

        // Create some auto-save versions
        $recentDocuments = Document::where('created_at', '>=', now()->subDays(7))->get();
        $recentDocuments->each(function ($document) {
            if (rand(1, 100) <= 50) { // 50% chance
                DocumentVersion::factory()->autoSave()->create([
                    'document_id' => $document->id,
                    'user_id' => $document->user_id,
                    'version_number' => $document->version_number + 1,
                ]);
            }
        });
    }
}