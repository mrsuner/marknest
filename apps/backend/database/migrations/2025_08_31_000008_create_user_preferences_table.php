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
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->onDelete('cascade');
            $table->string('theme', 20)->default('light'); // light, dark, auto
            $table->string('editor_theme', 50)->default('default');
            $table->string('editor_font_family', 100)->default('monospace');
            $table->integer('editor_font_size')->default(14);
            $table->boolean('editor_line_numbers')->default(true);
            $table->boolean('editor_word_wrap')->default(true);
            $table->boolean('editor_auto_save')->default(true);
            $table->integer('editor_auto_save_interval')->default(30); // seconds
            $table->boolean('preview_sync_scroll')->default(true);
            $table->string('preview_style', 50)->default('github');
            $table->string('default_view', 20)->default('split'); // edit, preview, split
            $table->boolean('enable_vim_mode')->default(false);
            $table->boolean('enable_spell_check')->default(true);
            $table->string('language', 10)->default('en');
            $table->string('timezone', 50)->default('UTC');
            $table->boolean('email_notifications')->default(true);
            $table->json('notification_settings')->nullable();
            $table->json('keyboard_shortcuts')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->unique('user_id', 'unq_user_preferences_user_id');
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};