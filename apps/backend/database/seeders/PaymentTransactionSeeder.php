<?php

namespace Database\Seeders;

use App\Models\Subscription;
use App\Models\PaymentTransaction;
use Illuminate\Database\Seeder;

class PaymentTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create payment transactions for existing subscriptions
        Subscription::with('user')->get()->each(function ($subscription) {
            // Create successful payments
            PaymentTransaction::factory(3)->succeeded()->create([
                'user_id' => $subscription->user_id,
                'subscription_id' => $subscription->id,
                'amount' => $subscription->amount,
                'type' => 'subscription',
            ]);

            // Create some failed payments
            PaymentTransaction::factory(1)->failed()->create([
                'user_id' => $subscription->user_id,
                'subscription_id' => $subscription->id,
                'amount' => $subscription->amount,
                'type' => 'subscription',
            ]);
        });

        // Create some one-time payments and refunds
        PaymentTransaction::factory(5)->succeeded()->create([
            'type' => 'payment',
        ]);

        PaymentTransaction::factory(2)->refund()->create();
    }
}