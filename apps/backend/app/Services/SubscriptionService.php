<?php

namespace App\Services;

use App\Data\SubscriptionPlanData;
use App\Data\SubscriptionStatusData;
use App\Models\User;
use Illuminate\Support\Collection;

class SubscriptionService
{
    /**
     * Get all available subscription plans
     */
    public function getPlans(): Collection
    {
        $plans = config('subscriptions.plans');

        return collect($plans)->map(function ($plan, $key) {
            return SubscriptionPlanData::from([
                ...$plan,
                'key' => $key,
            ]);
        });
    }

    /**
     * Get a specific plan by key
     */
    public function getPlan(string $planKey): ?SubscriptionPlanData
    {
        $plan = config("subscriptions.plans.{$planKey}");

        return $plan ? SubscriptionPlanData::from($plan) : null;
    }

    /**
     * Get user's subscription status
     */
    public function getStatus(User $user): SubscriptionStatusData
    {
        $subscription = $user->subscription('default');

        return SubscriptionStatusData::from([
            'subscribed' => $user->subscribed('default'),
            'plan' => $user->plan ?? 'free',
            'on_trial' => $user->onTrial(),
            'on_grace_period' => $subscription?->onGracePeriod() ?? false,
            'trial_ends_at' => $user->trial_ends_at,
            'current_period_end' => $subscription?->asStripeSubscription()?->current_period_end
                ? now()->createFromTimestamp($subscription->asStripeSubscription()->current_period_end)
                : null,
            'stripe_customer_id' => $user->stripe_id,
            'stripe_subscription_id' => $subscription?->stripe_id,
            'status' => $subscription?->stripe_status,
            'cancel_at_period_end' => $subscription?->asStripeSubscription()?->cancel_at_period_end ?? false,
        ]);
    }

    /**
     * Create a new subscription
     */
    public function subscribe(User $user, string $plan, string $billingCycle, ?string $paymentMethod = null): mixed
    {
        $priceId = $this->getPriceId($plan, $billingCycle);

        if (! $priceId) {
            throw new \InvalidArgumentException('Invalid plan or billing cycle');
        }

        // Add payment method if provided
        if ($paymentMethod) {
            $user->addPaymentMethod($paymentMethod);
            $user->updateDefaultPaymentMethod($paymentMethod);
        }

        // Check if user already has a subscription
        if ($user->subscribed('default')) {
            // Swap to new plan
            $subscription = $user->subscription('default')->swapAndInvoice($priceId);
        } else {
            // Create new subscription
            $subscriptionBuilder = $user->newSubscription('default', $priceId);

            // Add trial if configured and user hasn't used it
            if (config('subscriptions.trial.enabled') && ! $this->hasUsedTrial($user)) {
                $subscriptionBuilder->trialDays(config('subscriptions.trial.days'));
            }

            $subscription = $subscriptionBuilder->create($paymentMethod);
        }

        // Update user's plan and limits
        $this->updateUserPlanAndLimits($user, $plan);

        return $subscription;
    }

    /**
     * Cancel user's subscription
     */
    public function cancel(User $user): mixed
    {
        if (! $user->subscribed('default')) {
            throw new \Exception('No active subscription found');
        }

        return $user->subscription('default')->cancel();
    }

    /**
     * Resume cancelled subscription
     */
    public function resume(User $user): mixed
    {
        $subscription = $user->subscription('default');

        if (! $subscription || ! $subscription->onGracePeriod()) {
            throw new \Exception('No cancelled subscription found');
        }

        return $subscription->resume();
    }

    /**
     * Update user's plan and limits
     */
    public function updateUserPlanAndLimits(User $user, string $plan): void
    {
        $limits = config("subscriptions.plans.{$plan}.limits");

        $user->update([
            'plan' => $plan,
            'document_limit' => $limits['document_limit'],
            'storage_limit' => $limits['storage_limit'],
            'links_limit' => $limits['links_limit'],
            'version_history_days' => $limits['version_history_days'],
            'can_share_public' => true,
            'can_password_protect' => $plan !== 'free',
        ]);
    }

    /**
     * Get Stripe price ID for a plan and billing cycle
     */
    protected function getPriceId(string $plan, string $billingCycle): ?string
    {
        return config("subscriptions.plans.{$plan}.stripe_price_{$billingCycle}");
    }

    /**
     * Check if user has used their trial
     */
    protected function hasUsedTrial(User $user): bool
    {
        // Check if user has ever had a trial_ends_at date
        return $user->trial_ends_at !== null;
    }

    /**
     * Sync user's subscription from Stripe
     */
    public function syncFromStripe(User $user): void
    {
        if (! $user->stripe_id) {
            return;
        }

        // This will sync the subscription data from Stripe
        $user->syncStripeCustomerDetails();
    }
}
