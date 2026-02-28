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
        // Add/modify columns to make the table compatible with Laravel Cashier
        Schema::table('subscriptions', function (Blueprint $table) {
            // Add Cashier required columns if they don't exist
            if (! Schema::hasColumn('subscriptions', 'name')) {
                $table->string('name')->after('user_id')->nullable();
            }

            if (! Schema::hasColumn('subscriptions', 'stripe_id')) {
                $table->string('stripe_id')->unique()->nullable()->after('name');
            }

            if (! Schema::hasColumn('subscriptions', 'stripe_status')) {
                $table->string('stripe_status')->nullable()->after('stripe_id');
            }

            if (! Schema::hasColumn('subscriptions', 'stripe_price')) {
                $table->string('stripe_price')->nullable()->after('stripe_status');
            }

            if (! Schema::hasColumn('subscriptions', 'quantity')) {
                $table->integer('quantity')->nullable()->after('stripe_price');
            }

            // Rename our custom columns to avoid conflicts but keep them for custom logic
            if (Schema::hasColumn('subscriptions', 'stripe_subscription_id')) {
                $table->dropIndex('idx_subscriptions_stripe_subscription_id');
                $table->dropUnique(['stripe_subscription_id']);
                $table->dropColumn('stripe_subscription_id');
            }
        });

        // Create subscription_items table for Cashier
        Schema::create('subscription_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id');
            $table->string('stripe_id')->unique();
            $table->string('stripe_product');
            $table->string('stripe_price');
            $table->integer('quantity')->nullable();
            $table->timestamps();

            $table->unique(['subscription_id', 'stripe_price']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_items');

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn(['name', 'stripe_id', 'stripe_status', 'stripe_price', 'quantity']);
            $table->string('stripe_subscription_id')->unique()->nullable();
        });
    }
};
