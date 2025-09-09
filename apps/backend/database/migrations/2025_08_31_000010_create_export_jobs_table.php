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
        Schema::create('export_jobs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->onDelete('cascade');
            $table->foreignUlid('document_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('job_id', 36)->unique(); // UUID
            $table->string('format', 20); // pdf, docx, html, epub, latex
            $table->string('status', 20)->default('pending'); // pending, processing, completed, failed
            $table->json('options')->nullable(); // Export options (margins, fonts, etc.)
            $table->string('file_path')->nullable();
            $table->string('download_url')->nullable();
            $table->integer('file_size')->nullable();
            $table->text('error_message')->nullable();
            $table->integer('progress')->default(0); // 0-100
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('user_id', 'idx_export_jobs_user_id');
            $table->index('document_id', 'idx_export_jobs_document_id');
            $table->index('job_id', 'idx_export_jobs_job_id');
            $table->index('status', 'idx_export_jobs_status');
            $table->index('created_at', 'idx_export_jobs_created_at');
            $table->index(['user_id', 'status'], 'idx_export_jobs_user_status');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('export_jobs');
    }
};
