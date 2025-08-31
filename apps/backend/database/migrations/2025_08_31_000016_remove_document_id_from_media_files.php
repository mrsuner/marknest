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
        Schema::table('media_files', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign('fk_media_files_documents_document_id');
            $table->dropIndex('idx_media_files_document_id');
            $table->dropIndex('idx_media_files_user_document');
            
            // Drop the document_id column
            $table->dropColumn('document_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media_files', function (Blueprint $table) {
            // Add back the document_id column
            $table->foreignId('document_id')->nullable()->after('user_id');
            
            // Add back indexes and foreign key
            $table->index('document_id', 'idx_media_files_document_id');
            $table->index(['user_id', 'document_id'], 'idx_media_files_user_document');
            
            $table->foreign('document_id', 'fk_media_files_documents_document_id')
                  ->references('id')->on('documents')->onDelete('cascade');
        });
    }
};