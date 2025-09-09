<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\DocumentActionController;
use App\Http\Controllers\Api\DocumentShareController;
use App\Http\Controllers\Api\FolderController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\UserPreferenceController;
use App\Http\Controllers\SubscriptionController;

Route::prefix('auth')->group(function () {
    Route::post('/request-otp', [AuthController::class, 'requestOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->group(function () {

    Route::prefix('me')->group(function () {
        Route::get('/', [MeController::class, 'me']);
        Route::put('/', [MeController::class, 'update']);
        Route::put('password', [MeController::class, 'updatePassword']);
    });
    
    // User management
    Route::prefix('user')->group(function () {
        Route::get('profile', [UserController::class, 'profile']);
        
        // User preferences
        Route::get('preferences', [UserPreferenceController::class, 'show']);
        Route::put('preferences', [UserPreferenceController::class, 'update']);
        Route::post('preferences/reset', [UserPreferenceController::class, 'reset']);
    });

    // Document management
    Route::prefix('documents')->group(function () {
        Route::get('/', [DocumentController::class, 'index']);
        Route::post('/', [DocumentController::class, 'store']);
        Route::get('{document}', [DocumentController::class, 'show']);
        Route::put('{document}', [DocumentController::class, 'update']);
        Route::delete('{document}', [DocumentController::class, 'destroy']);
        Route::post('{document}/duplicate', [DocumentController::class, 'duplicate']);
        
        // Document actions
        Route::post('{document}/toggle-favorite', [DocumentActionController::class, 'toggleFavorite']);
        Route::post('{document}/toggle-archive', [DocumentActionController::class, 'toggleArchive']);
        Route::post('bulk-toggle-favorite', [DocumentActionController::class, 'bulkToggleFavorite']);
        Route::post('bulk-toggle-archive', [DocumentActionController::class, 'bulkToggleArchive']);
        
        // Version management
        Route::get('{document}/versions', [DocumentController::class, 'getVersions']);
        Route::get('{document}/versions/{versionId}', [DocumentController::class, 'getVersion']);
        Route::post('{document}/versions/{versionId}/restore', [DocumentController::class, 'restoreVersion']);
        
        // Media attachments
        Route::get('{document}/media', [DocumentController::class, 'getMedia']);
        Route::post('{document}/media/{mediaFile}', [DocumentController::class, 'attachMedia']);
        Route::put('{document}/media/{mediaFile}', [DocumentController::class, 'updateMediaAttachment']);
        Route::delete('{document}/media/{mediaFile}', [DocumentController::class, 'detachMedia']);
    });

    // Document sharing management
    Route::prefix('document-shares')->group(function () {
        Route::get('/', [DocumentShareController::class, 'index']);
        Route::post('/', [DocumentShareController::class, 'store']);
        Route::get('{share}', [DocumentShareController::class, 'show']);
        Route::put('{share}', [DocumentShareController::class, 'update']);
        Route::delete('{share}', [DocumentShareController::class, 'destroy']);
        Route::patch('{share}/toggle', [DocumentShareController::class, 'toggle']);
        Route::get('{share}/analytics', [DocumentShareController::class, 'analytics']);
        Route::post('bulk-update', [DocumentShareController::class, 'bulkUpdate']);
    });


    Route::prefix('files')->group(function (){
        Route::get('/', [FileController::class, 'index']);
        Route::post('/', [FileController::class, 'store']);
        Route::get('{file}', [FileController::class, 'show']);
        Route::put('{file}', [FileController::class, 'update']);
        Route::delete('{file}', [FileController::class, 'destroy']);
        Route::get('{file}/download', [FileController::class, 'download']);
    });
    // Folder management
    Route::prefix('folders')->group(function () {
        Route::get('/', [FolderController::class, 'index']);
        Route::get('/contents', [FolderController::class, 'getContents']); // Root folder contents
        Route::get('/search', [FolderController::class, 'search']);
        Route::post('/', [FolderController::class, 'store']);
        Route::get('{folder}', [FolderController::class, 'show']);
        Route::get('{folder}/contents', [FolderController::class, 'getContents']); // Specific folder contents
        Route::put('{folder}', [FolderController::class, 'update']);
        Route::delete('{folder}', [FolderController::class, 'destroy']);
        
        // Folder hierarchy operations
        Route::post('{folder}/move', [FolderController::class, 'move']);
        Route::get('{folder}/breadcrumbs', [FolderController::class, 'getBreadcrumbs']);
        Route::get('{folder}/children', [FolderController::class, 'getChildren']);
        Route::get('{folder}/documents', [FolderController::class, 'getDocuments']);
        Route::get('{folder}/tree', [FolderController::class, 'getTree']);
        
        // Bulk operations
        Route::post('bulk-move', [FolderController::class, 'bulkMove']);
        Route::post('bulk-delete', [FolderController::class, 'bulkDelete']);
        Route::get('recent', [FolderController::class, 'getRecentlyUsed']);
    });

    // Special document collections
    Route::prefix('collections')->group(function () {
        Route::get('favorites', [DocumentController::class, 'getFavorites']);
        Route::get('archived', [DocumentController::class, 'getArchived']);
        Route::get('recent', [DocumentController::class, 'getRecent']);
        Route::get('trash', [DocumentController::class, 'getTrashed']);
        Route::get('shared-with-me', [DocumentController::class, 'getSharedWithMe']);
        Route::get('my-shares', [DocumentController::class, 'getMyShares']);
    });

    // Search across documents and folders
    Route::get('search', [DocumentController::class, 'globalSearch']);
    
    // Subscription management
    Route::prefix('subscription')->group(function () {
        Route::get('plans', [SubscriptionController::class, 'plans']);
        Route::get('status', [SubscriptionController::class, 'status']);
        Route::get('setup-intent', [SubscriptionController::class, 'setupIntent']);
        Route::post('subscribe', [SubscriptionController::class, 'subscribe']);
        Route::put('change-plan', [SubscriptionController::class, 'changePlan']);
        Route::post('cancel', [SubscriptionController::class, 'cancel']);
        Route::post('resume', [SubscriptionController::class, 'resume']);
        
        // Payment methods
        Route::get('payment-methods', [SubscriptionController::class, 'paymentMethods']);
        Route::post('payment-methods', [SubscriptionController::class, 'addPaymentMethod']);
        Route::delete('payment-methods/{paymentMethodId}', [SubscriptionController::class, 'deletePaymentMethod']);
        
        // Invoices
        Route::get('invoices', [SubscriptionController::class, 'invoices']);
        Route::get('invoices/{invoiceId}/download', [SubscriptionController::class, 'downloadInvoice']);
    });
});

// Public sharing routes (no authentication required)
Route::prefix('public')->group(function () {
    Route::get('share/{token}', [DocumentController::class, 'getPublicDocument']);
    Route::post('share/{token}/view', [DocumentController::class, 'recordPublicView']);
    Route::post('share/{token}/download', [DocumentController::class, 'downloadPublicDocument']);
});

// Public routes for document shares
Route::get('share/{shareToken}', [DocumentShareController::class, 'publicView']);
Route::get('documents/{documentId}/active-share', [DocumentShareController::class, 'findActiveShareByDocument']);