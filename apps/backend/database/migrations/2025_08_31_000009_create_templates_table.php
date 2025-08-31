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
        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->longText('content');
            $table->string('category', 50); // personal, business, academic, technical
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('is_public')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->integer('usage_count')->default(0);
            $table->json('variables')->nullable(); // Template variables/placeholders
            $table->json('metadata')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('slug', 'idx_templates_slug');
            $table->index('category', 'idx_templates_category');
            $table->index('user_id', 'idx_templates_user_id');
            $table->index('is_public', 'idx_templates_is_public');
            $table->index('is_featured', 'idx_templates_is_featured');
            $table->index('usage_count', 'idx_templates_usage_count');
            $table->index(['is_public', 'category'], 'idx_templates_public_category');
            
            // Foreign keys with custom names
            $table->foreign('user_id', 'fk_templates_users_user_id')
                  ->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('templates');
    }
};