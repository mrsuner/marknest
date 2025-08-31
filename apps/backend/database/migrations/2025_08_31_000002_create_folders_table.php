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
        Schema::create('folders', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->foreignUlid('user_id')->constrained()->onDelete('cascade');
            $table->ulid('parent_id')->nullable();
            $table->string('path'); // Store full path for easier querying
            $table->integer('depth')->default(0);
            $table->integer('order')->default(0);
            $table->string('color', 7)->nullable(); // Hex color for UI
            $table->string('icon', 50)->nullable(); // Icon identifier
            $table->timestamps();

            // Indexes
            $table->index('user_id', 'idx_folders_user_id');
            
            $table->index('slug', 'idx_folders_slug');
            $table->index('path', 'idx_folders_path');
            
            
        });

        Schema::table('folders', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('folders')->onDelete('cascade');
            $table->index('parent_id', 'idx_folders_parent_id');
            $table->index(['user_id', 'parent_id'], 'idx_folders_user_parent');
            $table->unique(['user_id', 'parent_id', 'slug'], 'unq_folders_user_parent_slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('folders');
    }
};
