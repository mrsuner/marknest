<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\FolderController;
use App\Http\Controllers\Api\MeController;

Route::prefix('auth')->group(function () {
    Route::post('/request-otp', [AuthController::class, 'requestOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
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
        
    });

    // Document management
    Route::prefix('documents')->group(function () {
        Route::get('/', [DocumentController::class, 'index']);
        Route::post('/', [DocumentController::class, 'store']);
        Route::get('{document}', [DocumentController::class, 'show']);
        Route::put('{document}', [DocumentController::class, 'update']);
        Route::delete('{document}', [DocumentController::class, 'destroy']);
        
        // Document actions
        Route::post('{document}/duplicate', [DocumentController::class, 'duplicate']);
        Route::post('{document}/favorite', [DocumentController::class, 'toggleFavorite']);
        Route::post('{document}/archive', [DocumentController::class, 'toggleArchive']);
        Route::post('{document}/restore', [DocumentController::class, 'restore']);
        Route::post('{document}/move', [DocumentController::class, 'move']);
        Route::get('{document}/stats', [DocumentController::class, 'getStats']);
        
        // Version history
        Route::get('{document}/versions', [DocumentController::class, 'getVersions']);
        Route::get('{document}/versions/{version}', [DocumentController::class, 'getVersion']);
        Route::post('{document}/versions', [DocumentController::class, 'createVersion']);
        Route::post('{document}/versions/{version}/restore', [DocumentController::class, 'restoreVersion']);
        Route::get('{document}/versions/{version}/diff', [DocumentController::class, 'getVersionDiff']);
        
        // Collaboration
        Route::get('{document}/collaborators', [DocumentController::class, 'getCollaborators']);
        Route::post('{document}/collaborators', [DocumentController::class, 'addCollaborator']);
        Route::put('{document}/collaborators/{collaborator}', [DocumentController::class, 'updateCollaborator']);
        Route::delete('{document}/collaborators/{collaborator}', [DocumentController::class, 'removeCollaborator']);
        
        // Sharing
        Route::get('{document}/shares', [DocumentController::class, 'getShares']);
        Route::post('{document}/shares', [DocumentController::class, 'createShare']);
        Route::put('{document}/shares/{share}', [DocumentController::class, 'updateShare']);
        Route::delete('{document}/shares/{share}', [DocumentController::class, 'deleteShare']);
        Route::get('{document}/shares/{share}/stats', [DocumentController::class, 'getShareStats']);
        
        // Media attachments
        Route::get('{document}/media', [DocumentController::class, 'getMedia']);
        Route::post('{document}/media/{mediaFile}', [DocumentController::class, 'attachMedia']);
        Route::put('{document}/media/{mediaFile}', [DocumentController::class, 'updateMediaAttachment']);
        Route::delete('{document}/media/{mediaFile}', [DocumentController::class, 'detachMedia']);
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
});

// Public sharing routes (no authentication required)
Route::prefix('public')->group(function () {
    Route::get('share/{token}', [DocumentController::class, 'getPublicDocument']);
    Route::post('share/{token}/view', [DocumentController::class, 'recordPublicView']);
    Route::post('share/{token}/download', [DocumentController::class, 'downloadPublicDocument']);
});