<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateProfileRequest;
use App\RO\User\UserProfileRO;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class MeController extends Controller
{
    /**
     * Get current user profile
     *
     * Returns the authenticated user's profile information including plan details and usage quotas.
     *
     * @group User Profile
     *
     * @authenticated
     *
     * @response 200 scenario="Success" {
     *   "id": 1,
     *   "name": "John Doe",
     *   "email": "john@example.com",
     *   "plan": "free",
     *   "storage_used": 5242880,
     *   "storage_limit": 104857600,
     *   "document_count": 3,
     *   "document_limit": 10,
     *   "links_count": 2,
     *   "links_limit": 5,
     *   "version_limit": 10,
     *   "can_share_public": false,
     *   "can_password_protect": false,
     *   "has_password": true
     * }
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(UserProfileRO::fromUser($request->user()));
    }

    /**
     * Update user profile
     *
     * Update the authenticated user's profile information.
     *
     * @group User Profile
     *
     * @authenticated
     *
     * @bodyParam name string The user's display name. Example: John Doe
     * @bodyParam avatar_url string The URL to the user's avatar image. Example: https://example.com/avatar.jpg
     * @bodyParam bio string A short biography of the user (max 500 characters). Example: Software developer passionate about open source.
     *
     * @response 200 scenario="Success" {
     *   "id": "01HQ...",
     *   "name": "John Doe",
     *   "email": "john@example.com",
     *   "avatar_url": "https://example.com/avatar.jpg",
     *   "bio": "Software developer passionate about open source.",
     *   "plan": "free",
     *   "storage_used": 5242880,
     *   "storage_limit": 104857600,
     *   "document_count": 3,
     *   "document_limit": 10,
     *   "links_count": 2,
     *   "links_limit": 5,
     *   "version_limit": 10,
     *   "can_share_public": false,
     *   "can_password_protect": false,
     *   "has_password": true
     * }
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json(UserProfileRO::fromUser($user));
    }

    /**
     * Update or set password
     *
     * Update the authenticated user's password. If the user already has a password,
     * the current password must be provided for verification.
     *
     * @group User Profile
     *
     * @authenticated
     *
     * @bodyParam new_password string required The new password (minimum 8 characters). Example: newSecurePassword123
     * @bodyParam current_password string The current password. Required only if the user already has a password set. Example: currentPassword123
     *
     * @response 200 scenario="Password Updated" {
     *   "message": "Password updated successfully."
     * }
     * @response 200 scenario="Password Set (First Time)" {
     *   "message": "Password set successfully."
     * }
     * @response 422 scenario="Validation Error - Missing Current Password" {
     *   "message": "The given data was invalid.",
     *   "errors": {
     *     "current_password": ["Current password is required when updating existing password."]
     *   }
     * }
     * @response 422 scenario="Validation Error - Incorrect Current Password" {
     *   "message": "The given data was invalid.",
     *   "errors": {
     *     "current_password": ["The current password is incorrect."]
     *   }
     * }
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'new_password' => ['required', 'string', 'min:8'],
            'current_password' => ['nullable', 'string'],
        ]);

        // Check if user has an existing password
        $hasExistingPassword = ! empty($user->password);

        // If user has an existing password, require current password
        if ($hasExistingPassword) {
            if (empty($request->current_password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['Current password is required when updating existing password.'],
                ]);
            }

            // Verify current password
            if (! Hash::check($request->current_password, $user->password)) {
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
