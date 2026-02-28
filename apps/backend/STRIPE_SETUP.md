# Stripe & Laravel Cashier Setup Guide

## Setup Complete! ✅

Laravel Cashier and Stripe integration has been successfully set up for your Marknest backend.

## What's Been Configured

### 1. **Laravel Cashier Installation**
- ✅ Installed Laravel Cashier package
- ✅ Published and run migrations
- ✅ Configured User model with Billable trait

### 2. **Database Structure**
- ✅ Modified existing subscriptions table to be Cashier-compatible
- ✅ Added customer columns to users table
- ✅ Created subscription_items table

### 3. **Subscription Plans**
- **Free Plan**: 10 documents, 100MB storage, 7-day version history
- **Pro Plan**: $12/month or $120/year, unlimited documents, 10GB storage, 90-day version history
- **Enterprise Plan**: $29/month or $290/year, unlimited documents, 100GB storage, 365-day version history

### 4. **API Endpoints**
All endpoints are prefixed with `/api/subscription/`:
- `GET /plans` - Get available subscription plans
- `GET /status` - Get current subscription status
- `GET /setup-intent` - Create payment setup intent
- `POST /subscribe` - Subscribe to a plan
- `PUT /change-plan` - Change subscription plan
- `POST /cancel` - Cancel subscription
- `POST /resume` - Resume cancelled subscription
- `GET /payment-methods` - List payment methods
- `POST /payment-methods` - Add payment method
- `DELETE /payment-methods/{id}` - Remove payment method
- `GET /invoices` - Get invoice history
- `GET /invoices/{id}/download` - Download invoice

### 5. **Webhook Handler**
- Endpoint: `POST /stripe/webhook`
- Handles subscription updates, cancellations, payment events
- Automatically updates user plan and limits based on subscription status

## Next Steps

### 1. **Configure Stripe Dashboard**

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Create your products and prices in Stripe:
   ```
   Pro Monthly: Create a recurring price of $12/month
   Pro Yearly: Create a recurring price of $120/year
   Enterprise Monthly: Create a recurring price of $29/month
   Enterprise Yearly: Create a recurring price of $290/year
   ```

### 2. **Update Environment Variables**

Update your `.env` file with actual Stripe credentials:

```env
# Get from Stripe Dashboard > Developers > API keys
STRIPE_KEY=pk_live_YOUR_PUBLISHABLE_KEY
STRIPE_SECRET=sk_live_YOUR_SECRET_KEY

# Get the price IDs after creating products in Stripe
STRIPE_PRICE_PRO_MONTHLY=price_xxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxxxx
STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxxxx

# Configure webhook (see step 3)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 3. **Configure Stripe Webhook**

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://your-domain.com/stripe/webhook`
3. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.updated`
   - `customer.subscription.trial_will_end`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 4. **Test the Integration**

Use Stripe CLI for local testing:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8000/stripe/webhook

# Trigger test events
stripe trigger payment_intent.succeeded
```

### 5. **Frontend Integration**

The frontend will need to:
1. Load Stripe.js: `<script src="https://js.stripe.com/v3/"></script>`
2. Use the setup intent from `/api/subscription/setup-intent` to collect payment methods
3. Call `/api/subscription/subscribe` with the payment method and selected plan
4. Handle 3D Secure authentication if required

Example frontend code:
```javascript
// Initialize Stripe
const stripe = Stripe('your_publishable_key');

// Get setup intent
const { intent } = await fetch('/api/subscription/setup-intent').then(r => r.json());

// Collect payment method
const { error, paymentMethod } = await stripe.createPaymentMethod({
  type: 'card',
  card: cardElement,
});

// Subscribe
await fetch('/api/subscription/subscribe', {
  method: 'POST',
  body: JSON.stringify({
    plan: 'pro',
    billing_cycle: 'monthly',
    payment_method: paymentMethod.id
  })
});
```

## Testing Cards

Use these test cards in development:
- Success: `4242 4242 4242 4242`
- Requires authentication: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 9995`

## Support

For more information:
- Laravel Cashier Docs: https://laravel.com/docs/billing
- Stripe API Docs: https://stripe.com/docs/api
- Stripe Testing: https://stripe.com/docs/testing