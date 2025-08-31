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
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('plan', ['free', 'pro', 'enterprise'])->default('free');
            $table->bigInteger('storage_used')->default(0);
            $table->bigInteger('storage_limit')->default(104857600); // 100MB for free plan
            $table->integer('document_count')->default(0);
            $table->integer('document_limit')->default(10); // 10 docs for free plan
            $table->integer('version_history_days')->default(7); // 7 days for free plan
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