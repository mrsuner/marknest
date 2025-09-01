<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Attributes\MapName;
use Spatie\LaravelData\Attributes\Validation\In;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\RequiredIf;

class CreateSubscriptionData extends Data
{
    public function __construct(
        #[Required]
        #[In(['pro', 'enterprise'])]
        public string $plan,
        
        #[Required]
        #[In(['monthly', 'yearly'])]
        #[MapName('billing_cycle')]
        public string $billingCycle,
        
        #[RequiredIf('trial', false)]
        #[MapName('payment_method')]
        public ?string $paymentMethod = null,
        
        public bool $trial = true,
    ) {}
}