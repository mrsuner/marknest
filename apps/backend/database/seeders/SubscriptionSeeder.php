<?php

namespace Database\Seeders;

use App\Enums\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;

class SubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create subscriptions for non-free users
        $paidUsers = User::whereIn('plan', [Plan::Pro, Plan::Max])->get();

        $paidUsers->each(function ($user) {
            Subscription::factory()->create([
                'user_id' => $user->id,
                'plan' => $user->plan->value,
                'status' => 'active',
                'amount' => $user->plan === Plan::Pro ? 9.99 : 29.99,
                'current_period_start' => now()->subDays(15),
                'current_period_end' => now()->addDays(15),
            ]);
        });

        // Create some canceled and trial subscriptions
        Subscription::factory(3)->canceled()->create();
        Subscription::factory(2)->onTrial()->create();
    }
}
