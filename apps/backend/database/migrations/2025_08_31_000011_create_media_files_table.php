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
        Schema::create('media_files', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->onDelete('cascade');
        
            $table->string('original_name');
            $table->string('filename'); // Generated unique filename
            $table->string('mime_type', 100);
            $table->string('file_extension', 10);
            $table->integer('size'); // File size in bytes
            $table->string('disk', 20)->default('public'); // Storage disk
            $table->string('path'); // File path on disk
            $table->string('url')->nullable(); // Public URL if applicable
            $table->string('alt_text')->nullable(); // For accessibility
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Image dimensions, EXIF data, etc.
            $table->string('hash', 64)->nullable(); // File hash for deduplication
            $table->boolean('is_optimized')->default(false); // For image optimization
            $table->boolean('is_public')->default(false);
            $table->integer('download_count')->default(0);
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('user_id', 'idx_media_files_user_id');
            $table->index('filename', 'idx_media_files_filename');
            $table->index('mime_type', 'idx_media_files_mime_type');
            $table->index('hash', 'idx_media_files_hash');
            $table->index('is_public', 'idx_media_files_is_public');
            $table->index('created_at', 'idx_media_files_created_at');            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_files');
    }
};