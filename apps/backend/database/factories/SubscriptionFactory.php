<?php

namespace Database\Factories;

use App\Enums\Plan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $plan = fake()->randomElement(Plan::cases());
        $status = fake()->randomElement(['active', 'canceled', 'past_due', 'incomplete']);

        return [
            'user_id' => User::factory(),
            'name' => 'default',
            'stripe_id' => 'sub_'.fake()->regexify('[A-Za-z0-9]{24}'),
            'stripe_status' => $status,
            'stripe_price' => 'price_'.fake()->regexify('[A-Za-z0-9]{24}'),
            'quantity' => 1,
            'stripe_customer_id' => 'cus_'.fake()->regexify('[A-Za-z0-9]{14}'),
            'stripe_price_id' => 'price_'.fake()->regexify('[A-Za-z0-9]{24}'),
            'plan' => $plan->value,
            'status' => $status,
            'amount' => $this->getAmountForPlan($plan->value),
            'currency' => 'USD',
            'interval' => fake()->randomElement(['month', 'year']),
            'interval_count' => 1,
            'trial_ends_at' => fake()->optional()->dateTimeBetween('-1 month', '+1 month'),
            'current_period_start' => fake()->dateTimeBetween('-1 month', 'now'),
            'current_period_end' => fake()->dateTimeBetween('now', '+1 month'),
            'canceled_at' => $status === 'canceled' ? fake()->dateTimeBetween('-1 month', 'now') : null,
            'ends_at' => $status === 'canceled' ? fake()->dateTimeBetween('now', '+1 month') : null,
            'features' => $this->getFeaturesForPlan($plan->value),
            'limits' => $this->getLimitsForPlan($plan->value),
            'metadata' => [
                'created_from' => fake()->randomElement(['web', 'mobile', 'api']),
                'campaign' => fake()->optional()->word(),
            ],
        ];
    }

    private function getAmountForPlan(string $plan): float
    {
        return match ($plan) {
            'free' => 0.00,
            'pro' => 9.99,
            'max' => 29.99,
        };
    }

    private function getFeaturesForPlan(string $plan): array
    {
        return match ($plan) {
            'free' => ['basic_editor', 'limited_storage'],
            'pro' => ['advanced_editor', 'unlimited_versions', 'export_formats', 'sharing'],
            'max' => ['collaboration', 'api_access', 'priority_support', 'custom_branding'],
        };
    }

    private function getLimitsForPlan(string $plan): array
    {
        return match ($plan) {
            'free' => ['documents' => 10, 'storage' => 104857600], // 100MB
            'pro' => ['documents' => 1000, 'storage' => 5368709120], // 5GB
            'max' => ['documents' => 10000, 'storage' => 53687091200], // 50GB
        };
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'canceled_at' => null,
            'ends_at' => null,
        ]);
    }

    public function canceled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'canceled',
            'canceled_at' => fake()->dateTimeBetween('-1 month', 'now'),
            'ends_at' => fake()->dateTimeBetween('now', '+1 month'),
        ]);
    }

    public function onTrial(): static
    {
        return $this->state(fn (array $attributes) => [
            'trial_ends_at' => fake()->dateTimeBetween('now', '+2 weeks'),
        ]);
    }
}
