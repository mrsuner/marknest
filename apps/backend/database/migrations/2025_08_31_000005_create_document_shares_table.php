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
        Schema::create('document_shares', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('document_id')->constrained()->onDelete('cascade');
            $table->foreignUlid('user_id')->constrained()->onDelete('cascade');
            $table->string('share_token', 64)->unique();
            $table->string('short_url', 128)->unique()->nullable(); // Short URL identifier
            $table->string('password')->nullable(); // Hashed password for protection
            $table->timestamp('expires_at')->nullable();
            $table->integer('max_views')->nullable(); // Limit number of views
            $table->integer('view_count')->default(0);
            $table->boolean('allow_download')->default(false);
            $table->boolean('allow_copy')->default(false);
            $table->boolean('show_watermark')->default(false);
            $table->string('access_level', 20)->default('read'); // read, comment, edit
            $table->json('allowed_emails')->nullable(); // Restrict to specific emails
            $table->json('access_log')->nullable(); // Track who accessed when
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('document_id', 'idx_document_shares_document_id');
            $table->index('user_id', 'idx_document_shares_user_id');
            $table->index('share_token', 'idx_document_shares_share_token');
            $table->index('short_url', 'idx_document_shares_short_url');
            $table->index('expires_at', 'idx_document_shares_expires_at');
            $table->index('is_active', 'idx_document_shares_is_active');
            $table->index(['document_id', 'is_active'], 'idx_document_shares_doc_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_shares');
    }
};
