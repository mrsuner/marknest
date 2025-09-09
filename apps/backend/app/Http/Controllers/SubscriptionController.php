<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Cashier\Exceptions\IncompletePayment;

class SubscriptionController extends Controller
{
    /**
     * Get available subscription plans
     */
    public function plans(): JsonResponse
    {
        $plans = config('subscriptions.plans');

        return response()->json([
            'plans' => $plans,
            'trial' => config('subscriptions.trial'),
        ]);
    }

    /**
     * Get current user's subscription status
     */
    public function status(): JsonResponse
    {
        $user = Auth::user();

        $subscription = null;
        $onTrial = false;
        $onGracePeriod = false;

        if ($user->subscribed('default')) {
            $subscription = $user->subscription('default');
            $onGracePeriod = $subscription->onGracePeriod();
        }

        $onTrial = $user->onTrial();

        return response()->json([
            'subscribed' => $user->subscribed('default'),
            'subscription' => $subscription,
            'on_trial' => $onTrial,
            'on_grace_period' => $onGracePeriod,
            'trial_ends_at' => $user->trial_ends_at,
            'plan' => $user->plan ?? 'free',
            'stripe_customer_id' => $user->stripe_id,
            'payment_method' => $user->defaultPaymentMethod(),
        ]);
    }

    /**
     * Create or get Stripe setup intent for payment method
     */
    public function setupIntent(): JsonResponse
    {
        $user = Auth::user();

        return response()->json([
            'intent' => $user->createSetupIntent(),
            'stripe_key' => config('services.stripe.key', env('STRIPE_KEY')),
        ]);
    }

    /**
     * Add payment method to user
     */
    public function addPaymentMethod(Request $request): JsonResponse
    {
        $request->validate([
            'payment_method' => 'required|string',
        ]);

        $user = Auth::user();

        try {
            $user->addPaymentMethod($request->payment_method);
            $user->updateDefaultPaymentMethod($request->payment_method);

            return response()->json([
                'message' => 'Payment method added successfully',
                'payment_method' => $user->defaultPaymentMethod(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to add payment method',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get user's payment methods
     */
    public function paymentMethods(): JsonResponse
    {
        $user = Auth::user();

        return response()->json([
            'payment_methods' => $user->paymentMethods(),
            'default_payment_method' => $user->defaultPaymentMethod(),
        ]);
    }

    /**
     * Delete a payment method
     */
    public function deletePaymentMethod(string $paymentMethodId): JsonResponse
    {
        $user = Auth::user();

        try {
            $paymentMethod = $user->findPaymentMethod($paymentMethodId);

            if ($paymentMethod) {
                $paymentMethod->delete();

                return response()->json([
                    'message' => 'Payment method deleted successfully',
                ]);
            }

            return response()->json([
                'error' => 'Payment method not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete payment method',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Subscribe to a plan
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'plan' => 'required|string|in:pro,enterprise',
            'billing_cycle' => 'required|string|in:monthly,yearly',
            'payment_method' => 'required_if:trial,false|string',
        ]);

        $user = Auth::user();
        $plan = $request->plan;
        $billingCycle = $request->billing_cycle;

        // Get the Stripe price ID from config
        $priceKey = "subscriptions.plans.{$plan}.stripe_price_{$billingCycle}";
        $priceId = config($priceKey);

        if (! $priceId) {
            return response()->json([
                'error' => 'Invalid plan or billing cycle',
            ], 400);
        }

        try {
            // Add payment method if provided
            if ($request->has('payment_method')) {
                $user->addPaymentMethod($request->payment_method);
                $user->updateDefaultPaymentMethod($request->payment_method);
            }

            // Check if user already has a subscription
            if ($user->subscribed('default')) {
                // Swap to new plan
                $subscription = $user->subscription('default')->swapAndInvoice($priceId);
            } else {
                // Create new subscription
                $subscriptionBuilder = $user->newSubscription('default', $priceId);

                // Add trial if configured and user hasn't used it
                if (config('subscriptions.trial.enabled') && ! $user->hasUsedTrial()) {
                    $subscriptionBuilder->trialDays(config('subscriptions.trial.days'));
                }

                $subscription = $subscriptionBuilder->create($request->payment_method);
            }

            // Update user's plan in database
            $user->update(['plan' => $plan]);

            // Update user limits based on plan
            $limits = config("subscriptions.plans.{$plan}.limits");
            $user->update([
                'document_limit' => $limits['document_limit'],
                'storage_limit' => $limits['storage_limit'],
                'links_limit' => $limits['links_limit'],
                'version_history_days' => $limits['version_history_days'],
                'can_share_public' => true,
                'can_password_protect' => $plan !== 'free',
            ]);

            return response()->json([
                'message' => 'Subscription created successfully',
                'subscription' => $subscription,
            ]);
        } catch (IncompletePayment $e) {
            return response()->json([
                'error' => 'Payment requires additional action',
                'payment_intent' => $e->payment->asStripePaymentIntent(),
                'requires_action' => true,
            ], 402);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Subscription failed',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Change subscription plan
     */
    public function changePlan(Request $request): JsonResponse
    {
        $request->validate([
            'plan' => 'required|string|in:pro,enterprise',
            'billing_cycle' => 'required|string|in:monthly,yearly',
        ]);

        $user = Auth::user();

        if (! $user->subscribed('default')) {
            return response()->json([
                'error' => 'No active subscription found',
            ], 400);
        }

        $plan = $request->plan;
        $billingCycle = $request->billing_cycle;

        // Get the Stripe price ID from config
        $priceKey = "subscriptions.plans.{$plan}.stripe_price_{$billingCycle}";
        $priceId = config($priceKey);

        if (! $priceId) {
            return response()->json([
                'error' => 'Invalid plan or billing cycle',
            ], 400);
        }

        try {
            $subscription = $user->subscription('default')->swapAndInvoice($priceId);

            // Update user's plan in database
            $user->update(['plan' => $plan]);

            // Update user limits based on plan
            $limits = config("subscriptions.plans.{$plan}.limits");
            $user->update([
                'document_limit' => $limits['document_limit'],
                'storage_limit' => $limits['storage_limit'],
                'links_limit' => $limits['links_limit'],
                'version_history_days' => $limits['version_history_days'],
                'can_password_protect' => true,
            ]);

            return response()->json([
                'message' => 'Subscription plan changed successfully',
                'subscription' => $subscription,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to change plan',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Cancel subscription
     */
    public function cancel(): JsonResponse
    {
        $user = Auth::user();

        if (! $user->subscribed('default')) {
            return response()->json([
                'error' => 'No active subscription found',
            ], 400);
        }

        try {
            $subscription = $user->subscription('default')->cancel();

            return response()->json([
                'message' => 'Subscription cancelled successfully',
                'subscription' => $subscription,
                'ends_at' => $subscription->ends_at,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to cancel subscription',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Resume cancelled subscription
     */
    public function resume(): JsonResponse
    {
        $user = Auth::user();

        if (! $user->subscription('default') || ! $user->subscription('default')->onGracePeriod()) {
            return response()->json([
                'error' => 'No cancelled subscription found',
            ], 400);
        }

        try {
            $subscription = $user->subscription('default')->resume();

            return response()->json([
                'message' => 'Subscription resumed successfully',
                'subscription' => $subscription,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to resume subscription',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get invoice history
     */
    public function invoices(): JsonResponse
    {
        $user = Auth::user();

        try {
            $invoices = $user->invoices()->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'date' => $invoice->date()->toFormattedDateString(),
                    'total' => $invoice->total(),
                    'status' => $invoice->status,
                    'download_url' => $invoice->invoicePdf(),
                    'hosted_invoice_url' => $invoice->hostedInvoiceUrl(),
                ];
            });

            return response()->json([
                'invoices' => $invoices,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve invoices',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Download invoice
     */
    public function downloadInvoice(string $invoiceId): mixed
    {
        $user = Auth::user();

        try {
            return $user->downloadInvoice($invoiceId, [
                'vendor' => config('app.name'),
                'product' => 'Subscription',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to download invoice',
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
