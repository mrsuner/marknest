<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Subscription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PaymentTransaction>
 */
class PaymentTransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = fake()->randomFloat(2, 5, 100);
        $fee = round($amount * 0.029 + 0.30, 2); // Typical Stripe fee
        $netAmount = $amount - $fee;
        $status = fake()->randomElement(['pending', 'succeeded', 'failed', 'canceled', 'refunded']);

        return [
            'user_id' => User::factory(),
            'subscription_id' => fake()->optional()->passthrough(Subscription::factory()),
            'transaction_id' => 'pi_' . fake()->regexify('[A-Za-z0-9]{24}'),
            'stripe_payment_method_id' => 'pm_' . fake()->regexify('[A-Za-z0-9]{24}'),
            'type' => fake()->randomElement(['payment', 'refund', 'subscription', 'invoice']),
            'status' => $status,
            'amount' => $amount,
            'fee' => $fee,
            'net_amount' => $netAmount,
            'currency' => 'USD',
            'description' => fake()->sentence(),
            'payment_method' => fake()->randomElement(['card', 'bank_transfer', 'paypal']),
            'payment_method_details' => [
                'brand' => fake()->randomElement(['visa', 'mastercard', 'amex']),
                'last4' => fake()->numerify('####'),
                'exp_month' => fake()->numberBetween(1, 12),
                'exp_year' => fake()->numberBetween(2024, 2030),
            ],
            'failure_code' => $status === 'failed' ? fake()->randomElement(['card_declined', 'insufficient_funds', 'expired_card']) : null,
            'failure_message' => $status === 'failed' ? fake()->sentence() : null,
            'receipt_url' => $status === 'succeeded' ? fake()->url() : null,
            'invoice_id' => fake()->optional()->regexify('in_[A-Za-z0-9]{24}'),
            'metadata' => [
                'source' => fake()->randomElement(['web', 'mobile', 'api']),
                'user_agent' => fake()->userAgent(),
            ],
            'processed_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }

    public function succeeded(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'succeeded',
            'receipt_url' => fake()->url(),
            'failure_code' => null,
            'failure_message' => null,
            'processed_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'failure_code' => fake()->randomElement(['card_declined', 'insufficient_funds', 'expired_card']),
            'failure_message' => fake()->sentence(),
            'receipt_url' => null,
        ]);
    }

    public function refund(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'refund',
            'status' => 'succeeded',
            'amount' => -abs($attributes['amount']), // Negative for refunds
        ]);
    }
}