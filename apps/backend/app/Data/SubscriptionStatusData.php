<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Attributes\MapName;
use Carbon\Carbon;

class SubscriptionStatusData extends Data
{
    public function __construct(
        public bool $subscribed,
        public ?string $plan,
        #[MapName('on_trial')]
        public bool $onTrial,
        #[MapName('on_grace_period')]
        public bool $onGracePeriod,
        #[MapName('trial_ends_at')]
        public ?Carbon $trialEndsAt,
        #[MapName('current_period_end')]
        public ?Carbon $currentPeriodEnd,
        #[MapName('stripe_customer_id')]
        public ?string $stripeCustomerId,
        #[MapName('stripe_subscription_id')]
        public ?string $stripeSubscriptionId,
        public ?string $status,
        #[MapName('cancel_at_period_end')]
        public bool $cancelAtPeriodEnd = false,
    ) {}
}