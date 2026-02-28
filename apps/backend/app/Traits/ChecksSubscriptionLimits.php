<?php

namespace App\Traits;

use App\Models\User;

trait ChecksSubscriptionLimits
{
    /**
     * Get the user's upload size limit in bytes based on their subscription plan
     */
    protected function getUserUploadSizeLimit(User $user): int
    {
        $plan = config("subscriptions.plans.{$user->plan}", config('subscriptions.plans.free'));

        return $plan['limits']['upload_size_limit'] ?? 204800; // Default to 200KB
    }

    /**
     * Get the user's storage limit in bytes
     */
    protected function getUserStorageLimit(User $user): int
    {
        // Use the storage_limit from the user model if set, otherwise fall back to plan config
        if ($user->storage_limit > 0) {
            return $user->storage_limit;
        }

        $plan = config("subscriptions.plans.{$user->plan}", config('subscriptions.plans.free'));

        return $plan['limits']['storage_limit'] ?? 104857600; // Default to 100MB
    }

    /**
     * Get the user's current storage usage in bytes
     */
    protected function getUserStorageUsed(User $user): int
    {
        return $user->storage_used ?? 0;
    }

    /**
     * Get the user's remaining storage in bytes
     */
    protected function getUserStorageRemaining(User $user): int
    {
        $limit = $this->getUserStorageLimit($user);
        $used = $this->getUserStorageUsed($user);

        return max(0, $limit - $used);
    }

    /**
     * Check if the user has enough storage for a file
     */
    protected function userHasStorageFor(User $user, int $fileSize): bool
    {
        return $this->getUserStorageRemaining($user) >= $fileSize;
    }

    /**
     * Check if a file exceeds the user's upload size limit
     */
    protected function fileExceedsUploadLimit(User $user, int $fileSize): bool
    {
        return $fileSize > $this->getUserUploadSizeLimit($user);
    }

    /**
     * Format bytes to human readable size
     */
    protected function formatBytes(int $bytes, int $decimals = 2): string
    {
        if ($bytes == 0) {
            return '0 Bytes';
        }

        $k = 1024;
        $dm = $decimals < 0 ? 0 : $decimals;
        $sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

        $i = floor(log($bytes) / log($k));

        return number_format($bytes / pow($k, $i), $dm).' '.$sizes[$i];
    }
}
