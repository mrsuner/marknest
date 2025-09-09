<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Attributes\MapName;
use Carbon\Carbon;

class MediaFileData extends Data
{
    public function __construct(
        public string $id,
        #[MapName('user_id')]
        public string $userId,
        #[MapName('original_name')]
        public string $originalName,
        public string $filename,
        #[MapName('mime_type')]
        public string $mimeType,
        #[MapName('file_extension')]
        public string $fileExtension,
        public int $size,
        #[MapName('formatted_size')]
        public string $formattedSize,
        public string $disk,
        public string $path,
        public string $url,
        #[MapName('alt_text')]
        public ?string $altText,
        public ?string $description,
        public ?array $metadata,
        public ?string $hash,
        #[MapName('is_optimized')]
        public bool $isOptimized,
        #[MapName('is_public')]
        public bool $isPublic,
        #[MapName('download_count')]
        public int $downloadCount,
        #[MapName('last_accessed_at')]
        public ?Carbon $lastAccessedAt,
        #[MapName('created_at')]
        public Carbon $createdAt,
        #[MapName('updated_at')]
        public Carbon $updatedAt,
    ) {}
}