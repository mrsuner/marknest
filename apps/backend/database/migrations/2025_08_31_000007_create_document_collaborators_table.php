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
        Schema::create('document_collaborators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('invited_by')->constrained('users')->onDelete('cascade');
            $table->string('permission', 20)->default('view'); // view, comment, edit
            $table->boolean('can_share')->default(false);
            $table->boolean('can_delete')->default(false);
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('document_id', 'idx_document_collaborators_document_id');
            $table->index('user_id', 'idx_document_collaborators_user_id');
            $table->index('permission', 'idx_document_collaborators_permission');
            $table->unique(['document_id', 'user_id'], 'unq_document_collaborators_doc_user');
            
            // Foreign keys with custom names
            $table->foreign('document_id', 'fk_document_collaborators_documents_document_id')
                  ->references('id')->on('documents')->onDelete('cascade');
            $table->foreign('user_id', 'fk_document_collaborators_users_user_id')
                  ->references('id')->on('users')->onDelete('cascade');
            $table->foreign('invited_by', 'fk_document_collaborators_users_invited_by')
                  ->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_collaborators');
    }
};