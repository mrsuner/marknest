<?php

use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Stripe webhook endpoint (no CSRF protection needed)
Route::post(
    'stripe/webhook',
    [WebhookController::class, 'handleWebhook']
)->name('cashier.webhook');

Route::get('/health', function () {
    return response()->json(['status' => 'ok'], 200);
});
