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
        Schema::create('document_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->onDelete('cascade');
            $table->foreignId('media_file_id')->constrained()->onDelete('cascade');
            $table->string('usage_context', 50)->nullable(); // inline, attachment, cover, etc.
            $table->integer('order')->default(0); // For ordering media in document
            $table->json('metadata')->nullable(); // Position, size, alt text override, etc.
            $table->timestamps();
            
            // Indexes
            $table->index('document_id', 'idx_document_media_document_id');
            $table->index('media_file_id', 'idx_document_media_media_file_id');
            $table->index('usage_context', 'idx_document_media_usage_context');
            $table->index('order', 'idx_document_media_order');
            $table->unique(['document_id', 'media_file_id'], 'unq_document_media_doc_media');
            
            // Foreign keys with custom names
            $table->foreign('document_id', 'fk_document_media_documents_document_id')
                  ->references('id')->on('documents')->onDelete('cascade');
            $table->foreign('media_file_id', 'fk_document_media_media_files_media_file_id')
                  ->references('id')->on('media_files')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_media');
    }
};