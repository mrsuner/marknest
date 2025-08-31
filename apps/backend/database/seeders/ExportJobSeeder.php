<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Document;
use App\Models\ExportJob;
use Illuminate\Database\Seeder;

class ExportJobSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $documents = Document::with('user')->get();

        // Create export jobs for some documents
        $documents->each(function ($document) {
            if (rand(1, 100) <= 25) { // 25% chance
                $jobCount = rand(1, 3);
                
                for ($i = 0; $i < $jobCount; $i++) {
                    ExportJob::factory()->create([
                        'user_id' => $document->user_id,
                        'document_id' => $document->id,
                    ]);
                }
            }
        });

        // Create some completed export jobs
        ExportJob::factory(15)->completed()->create();

        // Create some failed export jobs
        ExportJob::factory(5)->failed()->create();

        // Create some recent export jobs for demo user
        $demoUser = User::where('email', 'demo@example.com')->first();
        if ($demoUser) {
            $demoDocuments = $demoUser->documents()->limit(3)->get();
            
            $demoDocuments->each(function ($document) use ($demoUser) {
                ExportJob::factory()->completed()->create([
                    'user_id' => $demoUser->id,
                    'document_id' => $document->id,
                    'format' => 'pdf',
                    'created_at' => now()->subHours(2),
                    'completed_at' => now()->subHours(1),
                ]);
            });
        }
    }
}