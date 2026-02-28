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
        Schema::create('tags', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug');
            $table->timestamps();

            $table->unique(['user_id', 'name'], 'unq_tags_user_name');
            $table->unique(['user_id', 'slug'], 'unq_tags_user_slug');
            $table->index('user_id', 'idx_tags_user_id');
        });

        Schema::create('document_tag', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('document_id')->constrained()->onDelete('cascade');
            $table->foreignUlid('tag_id')->constrained('tags')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['document_id', 'tag_id'], 'unq_document_tag');
            $table->index('tag_id', 'idx_document_tag_tag_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_tag');
        Schema::dropIfExists('tags');
    }
};
