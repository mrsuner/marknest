<?php

namespace App\RO\User;

use App\Models\User;
use Spatie\LaravelData\Attributes\MapName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;

#[MapName(SnakeCaseMapper::class)]
class UserProfileRO extends Data
{
    public function __construct(
        public string $id,
        public string $name,
        public string $email,
        public ?string $avatarUrl,
        public ?string $bio,
        public string $plan,
        public int $storageUsed,
        public int $storageLimit,
        public int $documentCount,
        public int $documentLimit,
        public int $linksCount,
        public int $linksLimit,
        public int $versionLimit,
        public bool $canSharePublic,
        public bool $canPasswordProtect,
        public bool $hasPassword,
    ) {}

    public static function fromUser(User $user): self
    {
        return new self(
            id: $user->id,
            name: $user->name,
            email: $user->email,
            avatarUrl: $user->avatar_url,
            bio: $user->bio,
            plan: $user->plan?->value ?? 'free',
            storageUsed: $user->storage_used ?? 0,
            storageLimit: $user->storage_limit ?? 104857600,
            documentCount: $user->document_count ?? 0,
            documentLimit: $user->document_limit ?? 10,
            linksCount: $user->links_count ?? 0,
            linksLimit: $user->links_limit ?? 5,
            versionLimit: $user->version_limit ?? 10,
            canSharePublic: $user->can_share_public ?? false,
            canPasswordProtect: $user->can_password_protect ?? false,
            hasPassword: ! empty($user->password),
        );
    }
}
