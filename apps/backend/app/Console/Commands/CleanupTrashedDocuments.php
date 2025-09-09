<?php

namespace App\Console\Commands;

use App\Models\Document;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupTrashedDocuments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'documents:cleanup-trashed {--days=30 : Number of days after which to permanently delete trashed documents}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Permanently delete documents that have been in trash for more than specified days (default: 30)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);

        $this->info("Searching for documents trashed before {$cutoffDate->toDateTimeString()}...");

        // Get documents that have been soft deleted for more than specified days
        $oldTrashedDocuments = Document::onlyTrashed()
            ->where('deleted_at', '<', $cutoffDate)
            ->get();

        if ($oldTrashedDocuments->isEmpty()) {
            $this->info('No documents found for permanent deletion.');

            return Command::SUCCESS;
        }

        $count = $oldTrashedDocuments->count();
        $this->info("Found {$count} document(s) to permanently delete.");

        if ($this->confirm("Do you want to permanently delete these {$count} document(s)?")) {
            $deletedCount = 0;

            foreach ($oldTrashedDocuments as $document) {
                try {
                    // Delete associated versions first
                    $document->versions()->delete();

                    // Delete associated shares
                    $document->shares()->delete();

                    // Delete associated collaborators
                    $document->collaborators()->delete();

                    // Detach media files
                    $document->mediaFiles()->detach();

                    // Force delete the document
                    $document->forceDelete();

                    $deletedCount++;
                    $this->line("Deleted: {$document->title} (ID: {$document->id})");

                    Log::info('Permanently deleted trashed document', [
                        'document_id' => $document->id,
                        'title' => $document->title,
                        'deleted_at' => $document->deleted_at,
                        'days_in_trash' => $document->deleted_at->diffInDays(now()),
                    ]);
                } catch (\Exception $e) {
                    $this->error("Failed to delete document {$document->id}: {$e->getMessage()}");
                    Log::error('Failed to permanently delete trashed document', [
                        'document_id' => $document->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $this->info("Successfully deleted {$deletedCount} document(s).");
        } else {
            $this->info('Operation cancelled.');
        }

        return Command::SUCCESS;
    }
}
