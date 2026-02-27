<?php

namespace App\Console\Commands;

use App\Models\Document;
use App\Models\Folder;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupTrashedFolders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'folders:cleanup-trashed {--days=90 : Number of days after which to permanently delete trashed folders}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Permanently delete folders that have been in trash for more than specified days (default: 90)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);

        $this->info("Searching for folders trashed before {$cutoffDate->toDateTimeString()}...");

        // Get root-level folders that have been soft deleted for more than specified days
        // We only get root-level trashed folders to avoid processing children separately
        $oldTrashedFolders = Folder::onlyTrashed()
            ->whereNull('parent_id')
            ->where('deleted_at', '<', $cutoffDate)
            ->orWhere(function ($query) use ($cutoffDate) {
                // Also get child folders whose parent is NOT trashed but they are
                $query->onlyTrashed()
                    ->whereNotNull('parent_id')
                    ->where('deleted_at', '<', $cutoffDate)
                    ->whereHas('parent', function ($q) {
                        $q->whereNull('deleted_at');
                    });
            })
            ->get();

        if ($oldTrashedFolders->isEmpty()) {
            $this->info('No folders found for permanent deletion.');

            return Command::SUCCESS;
        }

        $count = $oldTrashedFolders->count();
        $this->info("Found {$count} folder(s) to permanently delete.");

        if ($this->confirm("Do you want to permanently delete these {$count} folder(s)?")) {
            $deletedCount = 0;

            foreach ($oldTrashedFolders as $folder) {
                try {
                    $this->forceDeleteFolderRecursive($folder);
                    $folder->forceDelete();

                    $deletedCount++;
                    $this->line("Deleted: {$folder->name} (ID: {$folder->id})");

                    Log::info('Permanently deleted trashed folder', [
                        'folder_id' => $folder->id,
                        'name' => $folder->name,
                        'deleted_at' => $folder->deleted_at,
                        'days_in_trash' => $folder->deleted_at->diffInDays(now()),
                    ]);
                } catch (\Exception $e) {
                    $this->error("Failed to delete folder {$folder->id}: {$e->getMessage()}");
                    Log::error('Failed to permanently delete trashed folder', [
                        'folder_id' => $folder->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $this->info("Successfully deleted {$deletedCount} folder(s).");
        } else {
            $this->info('Operation cancelled.');
        }

        return Command::SUCCESS;
    }

    /**
     * Recursively force delete folder contents
     */
    private function forceDeleteFolderRecursive(Folder $folder): void
    {
        // Force delete all documents in this folder
        $documents = Document::withTrashed()->where('folder_id', $folder->id)->get();
        foreach ($documents as $document) {
            // Clean up document relations before force delete
            $document->versions()->delete();
            $document->shares()->delete();
            $document->collaborators()->delete();
            $document->mediaFiles()->detach();
            $document->tags()->detach();
            $document->forceDelete();
        }

        // Recursively force delete child folders
        $children = Folder::withTrashed()->where('parent_id', $folder->id)->get();
        foreach ($children as $child) {
            $this->forceDeleteFolderRecursive($child);
            $child->forceDelete();
        }
    }
}
