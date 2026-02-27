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
        Schema::create('document_versions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('document_id')->constrained()->onDelete('cascade');
            $table->foreignUlid('user_id')->constrained()->onDelete('cascade');
            $table->integer('version_number');
            $table->string('title');
            $table->longText('content');
            $table->longText('rendered_html')->nullable();
            $table->integer('size')->default(0);
            $table->integer('word_count')->default(0);
            $table->integer('character_count')->default(0);
            $table->text('change_summary')->nullable();
            $table->json('diff')->nullable(); // Store diff information
            $table->string('operation', 20)->default('update'); // create, update, restore
            $table->boolean('is_auto_save')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();

            // Indexes
            $table->index('document_id', 'idx_document_versions_document_id');
            $table->index('user_id', 'idx_document_versions_user_id');
            $table->index('version_number', 'idx_document_versions_version_number');
            $table->index('created_at', 'idx_document_versions_created_at');
            $table->index(['document_id', 'version_number'], 'idx_document_versions_doc_version');
            $table->unique(['document_id', 'version_number'], 'unq_document_versions_doc_version');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_versions');
    }
};
