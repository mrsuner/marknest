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
        Schema::create('users', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('avatar_url')->nullable();
            $table->text('bio')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->string('plan', 16)->default('free');
            $table->bigInteger('storage_used')->default(0);
            $table->bigInteger('storage_limit')->default(20971520); // 20MB for Free plan
            $table->integer('document_count')->default(0);
            $table->integer('document_limit')->default(100); // 100 docs for Free plan
            $table->integer('version_limit')->default(10); // 10 versions per doc for Free plan
            $table->boolean('can_share_public')->default(false);
            $table->boolean('can_password_protect')->default(false);
            $table->rememberToken();
            $table->timestamps();

            // Indexes
            $table->index('email', 'idx_users_email');
            $table->index('plan', 'idx_users_plan');
            $table->index('created_at', 'idx_users_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
