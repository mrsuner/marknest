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
        Schema::create('document_share_events', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('document_share_id')->constrained('document_shares')->onDelete('cascade');
            $table->string('event_type', 20); // view, download, copy, password_failed
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('document_share_id', 'idx_document_share_events_share_id');
            $table->index('event_type', 'idx_document_share_events_event_type');
            $table->index('created_at', 'idx_document_share_events_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_share_events');
    }
};
