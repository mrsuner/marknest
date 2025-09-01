<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

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
            'storage_limit' => $user->storage_limit ?? 104857600, // 100MB for free plan
            'document_count' => $user->document_count ?? 0,
            'document_limit' => $user->document_limit ?? 10, // 10 docs for free plan
            'links_count' => $user->links_count ?? 0,
            'links_limit' => $user->links_limit ?? 5, // 5 links for free plan
            'version_history_days' => $user->version_history_days ?? 7,
            'can_share_public' => $user->can_share_public ?? false,
            'can_password_protect' => $user->can_password_protect ?? false,
            'has_password' => !empty($user->password),
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
        $user = $request->user();
        
        $request->validate([
            'new_password' => ['required', 'string', 'min:8'],
            'current_password' => ['nullable', 'string'],
        ]);

        // Check if user has an existing password
        $hasExistingPassword = !empty($user->password);
        
        // If user has an existing password, require current password
        if ($hasExistingPassword) {
            if (empty($request->current_password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['Current password is required when updating existing password.'],
                ]);
            }
            
            // Verify current password
            if (!Hash::check($request->current_password, $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['The current password is incorrect.'],
                ]);
            }
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => $hasExistingPassword 
                ? 'Password updated successfully.' 
                : 'Password set successfully.',
        ]);
    }
}
