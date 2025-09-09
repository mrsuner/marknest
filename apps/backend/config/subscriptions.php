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
                'storage' => 100, // MB
                'version_history_days' => 7,
                'public_sharing' => true,
                'password_protection' => false,
                'export_formats' => ['md', 'html'],
                'collaboration' => false,
                'api_access' => false,
                'priority_support' => false,
            ],
            'limits' => [
                'document_limit' => 100,
                'storage_limit' => 104857600, // 100MB in bytes
                'upload_size_limit' => 204800, // 200KB per file
                'links_limit' => 5,
                'version_history_days' => 7,
            ],
        ],
        
        'pro' => [
            'name' => 'Pro',
            'description' => 'For power users and professionals',
            'price_monthly' => 12,
            'price_yearly' => 120, // $10/month when paid yearly
            'stripe_price_monthly' => env('STRIPE_PRICE_PRO_MONTHLY'),
            'stripe_price_yearly' => env('STRIPE_PRICE_PRO_YEARLY'),
            'features' => [
                'documents' => 100000,
                'storage' => 10240, // 10GB
                'version_history_days' => 90,
                'public_sharing' => true,
                'password_protection' => true,
                'export_formats' => ['md', 'html', 'pdf', 'docx'],
                'collaboration' => true,
                'api_access' => true,
                'priority_support' => true,
            ],
            'limits' => [
                'document_limit' => 100000, // Unlimited
                'storage_limit' => 10737418240, // 10GB in bytes
                'upload_size_limit' => 3145728, // 3MB per file
                'links_limit' => -1, // Unlimited
                'version_history_days' => 90,
            ],
        ],
        
        'max' => [
            'name' => 'Max',
            'description' => 'For person who who need more storage and features',
            'price_monthly' => 29,
            'price_yearly' => 290, // ~$24/month when paid yearly
            'stripe_price_monthly' => env('STRIPE_PRICE_ENTERPRISE_MONTHLY'),
            'stripe_price_yearly' => env('STRIPE_PRICE_ENTERPRISE_YEARLY'),
            'features' => [
                'documents' => -1,
                'storage' => 102400, // 100GB
                'version_history_days' => 365,
                'public_sharing' => true,
                'password_protection' => true,
                'export_formats' => ['md', 'html', 'pdf', 'docx', 'latex'],
                'collaboration' => true,
                'api_access' => true,
                'priority_support' => true,
                'custom_domain' => true,
                'sso' => true,
                'audit_logs' => true,
                'team_management' => true,
            ],
            'limits' => [
                'document_limit' => -1, // Unlimited
                'storage_limit' => 107374182400, // 100GB in bytes
                'upload_size_limit' => 5242880, // 5MB per file
                'links_limit' => -1, // Unlimited
                'version_history_days' => 365,
            ],
        ],
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Trial Configuration
    |--------------------------------------------------------------------------
    */
    
    'trial' => [
        'enabled' => true,
        'days' => 14,
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
        'days' => 3,
    ],
];