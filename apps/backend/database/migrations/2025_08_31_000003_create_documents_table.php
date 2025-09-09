<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('title');
            $table->string('slug');
            $table->longText('content')->nullable();
            $table->longText('rendered_html')->nullable(); // Cached rendered HTML
            $table->foreignUlid('user_id')->constrained()->onDelete('cascade');
            $table->foreignUlid('folder_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('size')->default(0); // File size in bytes
            $table->integer('word_count')->default(0);
            $table->integer('character_count')->default(0);
            $table->integer('version_number')->default(1);
            $table->boolean('is_favorite')->default(false);
            $table->boolean('is_archived')->default(false);
            $table->json('tags')->nullable(); // Store tags as JSON array
            $table->json('metadata')->nullable(); // Store additional metadata
            $table->string('status', 20)->default('draft'); // draft, published, private
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('user_id', 'idx_documents_user_id');
            $table->index('folder_id', 'idx_documents_folder_id');
            $table->index('slug', 'idx_documents_slug');
            $table->index('is_favorite', 'idx_documents_is_favorite');
            $table->index('is_archived', 'idx_documents_is_archived');
            $table->index('status', 'idx_documents_status');
            $table->index('created_at', 'idx_documents_created_at');
            $table->index('updated_at', 'idx_documents_updated_at');
            $table->index('last_accessed_at', 'idx_documents_last_accessed_at');
            $table->index(['user_id', 'folder_id'], 'idx_documents_user_folder');
            $table->unique(['user_id', 'folder_id', 'slug'], 'unq_documents_user_folder_slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
