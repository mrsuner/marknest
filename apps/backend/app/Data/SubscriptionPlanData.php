<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Attributes\MapName;

class SubscriptionPlanData extends Data
{
    public function __construct(
        public string $name,
        public string $description,
        #[MapName('price_monthly')]
        public float $priceMonthly,
        #[MapName('price_yearly')]
        public float $priceYearly,
        public array $features,
        public array $limits,
        #[MapName('stripe_price_monthly')]
        public ?string $stripePriceMonthly,
        #[MapName('stripe_price_yearly')]
        public ?string $stripePriceYearly,
    ) {}
}