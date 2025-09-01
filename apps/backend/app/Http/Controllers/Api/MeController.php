<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MeController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'plan' => $user->plan ?? 'free',
            'storage_used' => $user->storage_used ?? 0,
            'storage_limit' => $user->storage_limit ?? 20971520, // 20MB for free plan
            'document_count' => $user->document_count ?? 0,
            'document_limit' => $user->document_limit ?? 100, // 100 docs for free plan
            'version_history_days' => $user->version_history_days ?? 10,
            'can_share_public' => $user->can_share_public ?? false,
            'can_password_protect' => $user->can_password_protect ?? false,
        ]);
    }
    
    public function update(Request $request): JsonResponse
    {
        // Implementation for updating user profile
        // Placeholder for future implementation
        return response()->json(['message' => 'Not implemented yet'], 501);
    }
    
    public function updatePassword(Request $request): JsonResponse
    {
        // Implementation for updating user password
        // Placeholder for future implementation
        return response()->json(['message' => 'Not implemented yet'], 501);
    }
}
