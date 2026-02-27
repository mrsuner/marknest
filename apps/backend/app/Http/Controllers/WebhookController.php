<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Laravel\Cashier\Http\Controllers\WebhookController as CashierWebhookController;

class WebhookController extends CashierWebhookController
{
    /**
     * Handle customer subscription updated event
     */
    protected function handleCustomerSubscriptionUpdated(array $payload): void
    {
        parent::handleCustomerSubscriptionUpdated($payload);

        $subscription = $payload['data']['object'];
        $user = $this->getUserByStripeId($subscription['customer']);

        if ($user) {
            // Update user's plan based on the subscription status
            $this->updateUserPlan($user, $subscription);

            // Log subscription update
            Log::info('Subscription updated for user', [
                'user_id' => $user->id,
                'stripe_subscription_id' => $subscription['id'],
                'status' => $subscription['status'],
            ]);
        }
    }

    /**
     * Handle customer subscription deleted event
     */
    protected function handleCustomerSubscriptionDeleted(array $payload): void
    {
        parent::handleCustomerSubscriptionDeleted($payload);

        $subscription = $payload['data']['object'];
        $user = $this->getUserByStripeId($subscription['customer']);

        if ($user) {
            // Reset user to free plan
            $user->update([
                'plan' => 'free',
                'document_limit' => config('subscriptions.plans.free.limits.document_limit'),
                'storage_limit' => config('subscriptions.plans.free.limits.storage_limit'),
                'links_limit' => config('subscriptions.plans.free.limits.links_limit'),
                'version_limit' => config('subscriptions.plans.free.limits.version_limit'),
                'can_password_protect' => false,
            ]);

            Log::info('Subscription cancelled for user', [
                'user_id' => $user->id,
                'stripe_subscription_id' => $subscription['id'],
            ]);
        }
    }

    /**
     * Handle payment succeeded event
     */
    protected function handleInvoicePaymentSucceeded(array $payload): void
    {
        $invoice = $payload['data']['object'];
        $user = $this->getUserByStripeId($invoice['customer']);

        if ($user) {
            // Log successful payment
            Log::info('Payment succeeded for user', [
                'user_id' => $user->id,
                'invoice_id' => $invoice['id'],
                'amount' => $invoice['amount_paid'],
                'currency' => $invoice['currency'],
            ]);

            // You can add custom logic here, such as:
            // - Sending a payment confirmation email
            // - Recording the transaction in a custom table
            // - Updating usage quotas
        }
    }

    /**
     * Handle payment failed event
     */
    protected function handleInvoicePaymentFailed(array $payload): void
    {
        $invoice = $payload['data']['object'];
        $user = $this->getUserByStripeId($invoice['customer']);

        if ($user) {
            // Log failed payment
            Log::warning('Payment failed for user', [
                'user_id' => $user->id,
                'invoice_id' => $invoice['id'],
                'attempt_count' => $invoice['attempt_count'],
            ]);

            // You can add custom logic here, such as:
            // - Sending a payment failure notification
            // - Restricting user access after multiple failures
            // - Creating a support ticket
        }
    }

    /**
     * Handle customer updated event
     */
    protected function handleCustomerUpdated(array $payload): void
    {
        $customer = $payload['data']['object'];
        $user = $this->getUserByStripeId($customer['id']);

        if ($user) {
            // Update user's payment method info if changed
            if (isset($customer['invoice_settings']['default_payment_method'])) {
                // Payment method was updated
                Log::info('Customer payment method updated', [
                    'user_id' => $user->id,
                    'stripe_customer_id' => $customer['id'],
                ]);
            }
        }
    }

    /**
     * Handle subscription trial ending soon
     */
    protected function handleCustomerSubscriptionTrialWillEnd(array $payload): void
    {
        $subscription = $payload['data']['object'];
        $user = $this->getUserByStripeId($subscription['customer']);

        if ($user) {
            // Log trial ending soon
            Log::info('Trial ending soon for user', [
                'user_id' => $user->id,
                'trial_end' => $subscription['trial_end'],
            ]);

            // You can add custom logic here, such as:
            // - Sending a trial ending reminder email
            // - Offering a discount for immediate subscription
        }
    }

    /**
     * Get user by Stripe customer ID
     */
    protected function getUserByStripeId($stripeId)
    {
        return User::where('stripe_id', $stripeId)->first();
    }

    /**
     * Update user's plan based on subscription
     */
    protected function updateUserPlan(User $user, array $subscription): void
    {
        // Map Stripe price IDs to plan names
        $priceIdToPlan = [
            config('subscriptions.plans.pro.stripe_price_monthly') => 'pro',
            config('subscriptions.plans.pro.stripe_price_yearly') => 'pro',
            config('subscriptions.plans.max.stripe_price_monthly') => 'max',
            config('subscriptions.plans.max.stripe_price_yearly') => 'max',
        ];

        $priceId = $subscription['items']['data'][0]['price']['id'] ?? null;
        $plan = $priceIdToPlan[$priceId] ?? 'free';

        if ($subscription['status'] === 'active' || $subscription['status'] === 'trialing') {
            // Update to the subscribed plan
            $limits = config("subscriptions.plans.{$plan}.limits");

            $user->update([
                'plan' => $plan,
                'document_limit' => $limits['document_limit'],
                'storage_limit' => $limits['storage_limit'],
                'links_limit' => $limits['links_limit'],
                'version_limit' => $limits['version_limit'],
                'can_password_protect' => $plan !== 'free',
            ]);
        } elseif (in_array($subscription['status'], ['canceled', 'unpaid', 'past_due'])) {
            // Reset to free plan if subscription is not active
            $user->update([
                'plan' => 'free',
                'document_limit' => config('subscriptions.plans.free.limits.document_limit'),
                'storage_limit' => config('subscriptions.plans.free.limits.storage_limit'),
                'links_limit' => config('subscriptions.plans.free.limits.links_limit'),
                'version_limit' => config('subscriptions.plans.free.limits.version_limit'),
                'can_password_protect' => false,
            ]);
        }
    }
}
