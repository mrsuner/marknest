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
            $table->ulid('id')->primary();
            $table->foreignUlid('document_id')->constrained()->onDelete('cascade');
            $table->foreignUlid('user_id')->constrained()->onDelete('cascade');
            $table->foreignUlid('invited_by')->constrained('users')->onDelete('cascade');
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
