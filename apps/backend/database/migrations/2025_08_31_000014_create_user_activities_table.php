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
        Schema::create('user_activities', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->onDelete('cascade');
            $table->string('activity_type', 50); // login, document_create, document_update, etc.
            $table->string('entity_type', 50)->nullable(); // document, folder, share
            $table->string('entity_id', 26)->nullable(); // ULID support
            $table->string('description');
            $table->json('metadata')->nullable(); // Additional activity data
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('created_at')->nullable();

            // Indexes
            $table->index('user_id', 'idx_user_activities_user_id');
            $table->index('activity_type', 'idx_user_activities_activity_type');
            $table->index('entity_type', 'idx_user_activities_entity_type');
            $table->index('entity_id', 'idx_user_activities_entity_id');
            $table->index('created_at', 'idx_user_activities_created_at');
            $table->index(['user_id', 'created_at'], 'idx_user_activities_user_created');
            $table->index(['entity_type', 'entity_id'], 'idx_user_activities_entity');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_activities');
    }
};
