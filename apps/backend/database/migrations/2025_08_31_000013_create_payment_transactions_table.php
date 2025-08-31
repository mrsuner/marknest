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
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('subscription_id')->nullable()->constrained()->onDelete('set null');
            $table->string('transaction_id', 100)->unique(); // Stripe payment intent ID
            $table->string('stripe_payment_method_id')->nullable();
            $table->string('type', 20); // payment, refund, subscription, invoice
            $table->string('status', 20); // pending, succeeded, failed, canceled, refunded
            $table->decimal('amount', 10, 2);
            $table->decimal('fee', 10, 2)->default(0); // Processing fee
            $table->decimal('net_amount', 10, 2); // Amount minus fees
            $table->string('currency', 3)->default('USD');
            $table->string('description')->nullable();
            $table->string('payment_method', 50)->nullable(); // card, bank_transfer, etc.
            $table->json('payment_method_details')->nullable(); // Last 4 digits, brand, etc.
            $table->string('failure_code')->nullable();
            $table->string('failure_message')->nullable();
            $table->string('receipt_url')->nullable();
            $table->string('invoice_id')->nullable(); // For subscription invoices
            $table->json('metadata')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('user_id', 'idx_payment_transactions_user_id');
            $table->index('subscription_id', 'idx_payment_transactions_subscription_id');
            $table->index('transaction_id', 'idx_payment_transactions_transaction_id');
            $table->index('type', 'idx_payment_transactions_type');
            $table->index('status', 'idx_payment_transactions_status');
            $table->index('processed_at', 'idx_payment_transactions_processed_at');
            $table->index('created_at', 'idx_payment_transactions_created_at');
            $table->index(['user_id', 'type'], 'idx_payment_transactions_user_type');
            $table->index(['user_id', 'status'], 'idx_payment_transactions_user_status');
            
            // Foreign keys with custom names
            $table->foreign('user_id', 'fk_payment_transactions_users_user_id')
                  ->references('id')->on('users')->onDelete('cascade');
            $table->foreign('subscription_id', 'fk_payment_transactions_subscriptions_subscription_id')
                  ->references('id')->on('subscriptions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};