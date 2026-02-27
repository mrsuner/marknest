<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Subscription Plans Configuration
    |--------------------------------------------------------------------------
    |
    | Define your subscription plans and their features here.
    | These will be used throughout the application to manage user subscriptions.
    |
    */

    'plans' => [
        'free' => [
            'name' => 'Free',
            'description' => 'Perfect for getting started',
            'price_monthly' => 0,
            'price_yearly' => 0,
            'stripe_price_monthly' => null,
            'stripe_price_yearly' => null,
            'features' => [
                'documents' => 100,
                'storage' => 20, // MB
                'version_limit' => 10,
                'public_sharing' => false,
                'password_protection' => false,
                'export_formats' => ['md', 'html', 'pdf', 'docx'],
                'collaboration' => false,
                'api_access' => false,
                'priority_support' => false,
            ],
            'limits' => [
                'document_limit' => 100,
                'storage_limit' => 20 * 1024 * 1024, // 20MB in bytes
                'upload_size_limit' => 300 * 1024, // 300KB per file
                'links_limit' => 0,
                'version_limit' => 10,
            ],
        ],

        'pro' => [
            'name' => 'Pro',
            'description' => 'For power users and professionals',
            'price_monthly' => 1.99,
            'price_yearly' => 19.9,
            'stripe_price_monthly' => env('STRIPE_PRICE_PRO_MONTHLY'),
            'stripe_price_yearly' => env('STRIPE_PRICE_PRO_YEARLY'),
            'features' => [
                'documents' => 5000,
                'storage' => 1024, // 1GB
                'version_limit' => 100,
                'public_sharing' => true,
                'password_protection' => true,
                'export_formats' => ['md', 'html', 'pdf', 'docx'],
                'collaboration' => true,
                'api_access' => true,
                'priority_support' => true,
            ],
            'limits' => [
                'document_limit' => 5000,
                'storage_limit' => 1024 * 1024 * 1024, // 1GB in bytes
                'upload_size_limit' => 5 * 1024 * 1024, // 5MB per file
                'links_limit' => 100,
                'version_limit' => 100,
            ],
        ],

        'max' => [
            'name' => 'Max',
            'description' => 'For users who need more storage and features',
            'price_monthly' => 3.99,
            'price_yearly' => 39.9,
            'stripe_price_monthly' => env('STRIPE_PRICE_MAX_MONTHLY'),
            'stripe_price_yearly' => env('STRIPE_PRICE_MAX_YEARLY'),
            'features' => [
                'documents' => -1,
                'storage' => 10240, // 10GB
                'version_limit' => 100,
                'public_sharing' => true,
                'password_protection' => true,
                'export_formats' => ['md', 'html', 'pdf', 'docx'],
                'collaboration' => true,
                'api_access' => true,
                'priority_support' => true,
            ],
            'limits' => [
                'document_limit' => -1, // Unlimited
                'storage_limit' => 10 * 1024 * 1024 * 1024, // 10GB in bytes
                'upload_size_limit' => 10 * 1024 * 1024, // 10MB per file
                'links_limit' => 1000,
                'version_limit' => 100,
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Trial Configuration
    |--------------------------------------------------------------------------
    */

    'trial' => [
        'enabled' => false,
        'days' => 0,
        'require_payment_method' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | Stripe Configuration
    |--------------------------------------------------------------------------
    */

    'stripe' => [
        'webhook_tolerance' => env('STRIPE_WEBHOOK_TOLERANCE', 300),
        'tax_enabled' => env('STRIPE_TAX_ENABLED', false),
        'tax_rates' => [],
    ],

    /*
    |--------------------------------------------------------------------------
    | Grace Period Configuration
    |--------------------------------------------------------------------------
    */

    'grace_period' => [
        'days' => 0,
    ],
];
