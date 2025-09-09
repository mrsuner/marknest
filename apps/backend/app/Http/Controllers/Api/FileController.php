<?php

namespace App\Http\Controllers\Api;

use App\Data\MediaFileData;
use App\Http\Controllers\Controller;
use App\Models\MediaFile;
use App\Traits\ChecksSubscriptionLimits;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class FileController extends Controller
{
    use ChecksSubscriptionLimits;

    public function index(Request $request): JsonResponse
    {
        $query = MediaFile::where('user_id', $request->user()->id);

        // Filter by file type if specified
        if ($request->has('type')) {
            $type = $request->input('type');
            switch ($type) {
                case 'images':
                    $query->where('mime_type', 'like', 'image/%');
                    break;
                case 'documents':
                    $query->whereIn('mime_type', [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'text/plain',
                        'text/markdown',
                        'text/csv',
                    ]);
                    break;
            }
        }

        // Search by filename or original name
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('original_name', 'like', "%{$search}%")
                    ->orWhere('filename', 'like', "%{$search}%");
            });
        }

        // Filter by public status
        if ($request->has('public')) {
            $query->where('is_public', $request->boolean('public'));
        }

        // Sort options
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');

        $allowedSortFields = ['original_name', 'size', 'created_at', 'last_accessed_at', 'download_count'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Pagination
        $perPage = min($request->input('per_page', 50), 100);
        $files = $query->paginate($perPage);

        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => MediaFileData::collect($files->items()),
            'meta' => [
                'current_page' => $files->currentPage(),
                'last_page' => $files->lastPage(),
                'per_page' => $files->perPage(),
                'total' => $files->total(),
            ],
            'storage' => [
                'used' => $this->getUserStorageUsed($user),
                'limit' => $this->getUserStorageLimit($user),
                'remaining' => $this->getUserStorageRemaining($user),
                'used_formatted' => $this->formatBytes($this->getUserStorageUsed($user)),
                'limit_formatted' => $this->formatBytes($this->getUserStorageLimit($user)),
                'remaining_formatted' => $this->formatBytes($this->getUserStorageRemaining($user)),
            ],
            'limits' => [
                'upload_size_limit' => $this->getUserUploadSizeLimit($user),
                'upload_size_limit_formatted' => $this->formatBytes($this->getUserUploadSizeLimit($user)),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get user's upload size limit in KB for validation rule
        $uploadLimitKB = ceil($this->getUserUploadSizeLimit($user) / 1024);

        $validator = Validator::make($request->all(), [
            'files' => 'required|array|max:10',
            'files.*' => "required|file|max:{$uploadLimitKB}", // Dynamic limit based on user's plan
            'alt_text.*' => 'nullable|string|max:255',
            'description.*' => 'nullable|string|max:1000',
            'is_public.*' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
                'limits' => [
                    'upload_size_limit' => $this->getUserUploadSizeLimit($user),
                    'upload_size_limit_formatted' => $this->formatBytes($this->getUserUploadSizeLimit($user)),
                ],
            ], 422);
        }

        // Check total storage before processing files
        $totalSize = 0;
        $files = $request->file('files');
        foreach ($files as $file) {
            $totalSize += $file->getSize();
        }

        if (! $this->userHasStorageFor($user, $totalSize)) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient storage space. Please upgrade your plan or delete some files.',
                'storage' => [
                    'used' => $this->getUserStorageUsed($user),
                    'limit' => $this->getUserStorageLimit($user),
                    'remaining' => $this->getUserStorageRemaining($user),
                    'used_formatted' => $this->formatBytes($this->getUserStorageUsed($user)),
                    'limit_formatted' => $this->formatBytes($this->getUserStorageLimit($user)),
                    'remaining_formatted' => $this->formatBytes($this->getUserStorageRemaining($user)),
                    'required' => $totalSize,
                    'required_formatted' => $this->formatBytes($totalSize),
                ],
            ], 422);
        }

        $uploadedFiles = [];
        $altTexts = $request->input('alt_text', []);
        $descriptions = $request->input('description', []);
        $isPublicFlags = $request->input('is_public', []);

        foreach ($files as $index => $file) {
            try {
                // Double-check individual file size
                if ($this->fileExceedsUploadLimit($user, $file->getSize())) {
                    $uploadedFiles[] = [
                        'success' => false,
                        'message' => 'File exceeds upload size limit',
                        'original_name' => $file->getClientOriginalName(),
                        'file_size' => $file->getSize(),
                        'file_size_formatted' => $this->formatBytes($file->getSize()),
                        'limit' => $this->getUserUploadSizeLimit($user),
                        'limit_formatted' => $this->formatBytes($this->getUserUploadSizeLimit($user)),
                    ];

                    continue;
                }
                // Generate file hash for duplicate detection
                $fileContent = file_get_contents($file->getRealPath());
                $fileHash = hash('sha256', $fileContent);

                // Check if file already exists for this user
                $existingFile = MediaFile::where('user_id', $request->user()->id)
                    ->where('hash', $fileHash)
                    ->first();

                if ($existingFile) {
                    $uploadedFiles[] = [
                        'success' => false,
                        'message' => 'File already exists',
                        'original_name' => $file->getClientOriginalName(),
                        'existing_file' => MediaFileData::from($existingFile),
                    ];

                    continue;
                }

                // Generate unique filename
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $filename = Str::uuid().'.'.$extension;

                // Store file
                $path = $file->storeAs('media', $filename, 'public');

                // Create database record
                $mediaFile = MediaFile::create([
                    'user_id' => $request->user()->id,
                    'original_name' => $originalName,
                    'filename' => $filename,
                    'mime_type' => $file->getMimeType(),
                    'file_extension' => $extension,
                    'size' => $file->getSize(),
                    'disk' => 'public',
                    'path' => $path,
                    'alt_text' => $altTexts[$index] ?? null,
                    'description' => $descriptions[$index] ?? null,
                    'hash' => $fileHash,
                    'is_optimized' => false,
                    'is_public' => $isPublicFlags[$index] ?? false,
                    'download_count' => 0,
                ]);

                $uploadedFiles[] = [
                    'success' => true,
                    'file' => MediaFileData::from($mediaFile),
                ];

                // Update user's storage usage
                $user->increment('storage_used', $file->getSize());

            } catch (\Exception $e) {
                $uploadedFiles[] = [
                    'success' => false,
                    'message' => 'Upload failed: '.$e->getMessage(),
                    'original_name' => $file->getClientOriginalName(),
                ];
            }
        }

        $successCount = collect($uploadedFiles)->where('success', true)->count();
        $failureCount = collect($uploadedFiles)->where('success', false)->count();

        // Refresh user to get updated storage_used
        $user->refresh();

        return response()->json([
            'success' => $successCount > 0,
            'message' => "Uploaded {$successCount} files successfully".
                        ($failureCount > 0 ? ", {$failureCount} failed" : ''),
            'data' => $uploadedFiles,
            'summary' => [
                'total' => count($uploadedFiles),
                'successful' => $successCount,
                'failed' => $failureCount,
            ],
            'storage' => [
                'used' => $this->getUserStorageUsed($user),
                'limit' => $this->getUserStorageLimit($user),
                'remaining' => $this->getUserStorageRemaining($user),
                'used_formatted' => $this->formatBytes($this->getUserStorageUsed($user)),
                'limit_formatted' => $this->formatBytes($this->getUserStorageLimit($user)),
                'remaining_formatted' => $this->formatBytes($this->getUserStorageRemaining($user)),
            ],
            'limits' => [
                'upload_size_limit' => $this->getUserUploadSizeLimit($user),
                'upload_size_limit_formatted' => $this->formatBytes($this->getUserUploadSizeLimit($user)),
            ],
        ], $successCount > 0 ? 201 : 422);
    }

    public function show(Request $request, MediaFile $file): JsonResponse
    {
        // Ensure the file belongs to the authenticated user
        if ($file->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => MediaFileData::from($file),
        ]);
    }

    public function update(Request $request, MediaFile $file): JsonResponse
    {
        // Ensure the file belongs to the authenticated user
        if ($file->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'alt_text' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_public' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $file->update($request->only(['alt_text', 'description', 'is_public']));

        return response()->json([
            'success' => true,
            'data' => MediaFileData::from($file->fresh()),
        ]);
    }

    public function destroy(Request $request, MediaFile $file): JsonResponse
    {
        // Ensure the file belongs to the authenticated user
        if ($file->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        try {
            // Store file size before deletion
            $fileSize = $file->size;

            // Delete the actual file from storage
            if (Storage::disk($file->disk)->exists($file->path)) {
                Storage::disk($file->disk)->delete($file->path);
            }

            // Delete the database record
            $file->delete();

            // Update user's storage usage
            $user = $request->user();
            $user->decrement('storage_used', $fileSize);

            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully',
                'storage' => [
                    'used' => $this->getUserStorageUsed($user),
                    'limit' => $this->getUserStorageLimit($user),
                    'remaining' => $this->getUserStorageRemaining($user),
                    'used_formatted' => $this->formatBytes($this->getUserStorageUsed($user)),
                    'limit_formatted' => $this->formatBytes($this->getUserStorageLimit($user)),
                    'remaining_formatted' => $this->formatBytes($this->getUserStorageRemaining($user)),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete file: '.$e->getMessage(),
            ], 500);
        }
    }

    public function download(Request $request, MediaFile $file): \Symfony\Component\HttpFoundation\Response
    {
        // Ensure the file belongs to the authenticated user or is public
        if ($file->user_id !== $request->user()->id && ! $file->is_public) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        // Check if file exists in storage
        if (! Storage::disk($file->disk)->exists($file->path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found in storage',
            ], 404);
        }

        // Update download count and last accessed time
        $file->increment('download_count');
        $file->update(['last_accessed_at' => now()]);

        // Return the file as a download response
        return Storage::disk($file->disk)->download(
            $file->path,
            $file->original_name
        );
    }
}
