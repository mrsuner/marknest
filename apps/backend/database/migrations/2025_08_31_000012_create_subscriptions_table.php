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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->onDelete('cascade');
            $table->string('stripe_subscription_id')->unique()->nullable();
            $table->string('stripe_customer_id')->nullable();
            $table->string('stripe_price_id')->nullable();
            $table->string('plan', 20); // free, pro, enterprise
            $table->string('status', 20); // active, canceled, past_due, incomplete, unpaid
            $table->decimal('amount', 8, 2)->nullable(); // Monthly/yearly amount
            $table->string('currency', 3)->default('USD');
            $table->string('interval', 10)->nullable(); // month, year
            $table->integer('interval_count')->default(1);
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamp('canceled_at')->nullable();
            $table->timestamp('ends_at')->nullable(); // When subscription actually ends
            $table->json('features')->nullable(); // Plan-specific features
            $table->json('limits')->nullable(); // Storage, documents, etc.
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('user_id', 'idx_subscriptions_user_id');
            $table->index('stripe_subscription_id', 'idx_subscriptions_stripe_subscription_id');
            $table->index('stripe_customer_id', 'idx_subscriptions_stripe_customer_id');
            $table->index('plan', 'idx_subscriptions_plan');
            $table->index('status', 'idx_subscriptions_status');
            $table->index('current_period_end', 'idx_subscriptions_current_period_end');
            $table->index(['user_id', 'status'], 'idx_subscriptions_user_status');
            $table->unique('user_id', 'unq_subscriptions_user_id');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
