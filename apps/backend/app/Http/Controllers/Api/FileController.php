<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MediaFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class FileController extends Controller
{
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
                        'text/csv'
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

        return response()->json([
            'success' => true,
            'data' => $files->items(),
            'meta' => [
                'current_page' => $files->currentPage(),
                'last_page' => $files->lastPage(),
                'per_page' => $files->perPage(),
                'total' => $files->total(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'files' => 'required|array|max:10',
            'files.*' => 'required|file|max:10240', // 10MB max per file
            'alt_text.*' => 'nullable|string|max:255',
            'description.*' => 'nullable|string|max:1000',
            'is_public.*' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $uploadedFiles = [];
        $files = $request->file('files');
        $altTexts = $request->input('alt_text', []);
        $descriptions = $request->input('description', []);
        $isPublicFlags = $request->input('is_public', []);

        foreach ($files as $index => $file) {
            try {
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
                        'existing_file' => $existingFile
                    ];
                    continue;
                }

                // Generate unique filename
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $filename = Str::uuid() . '.' . $extension;

                // Store file
                $path = $file->storeAs('media', $filename, 'public');
                $url = Storage::url($path);

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
                    'url' => $url,
                    'alt_text' => $altTexts[$index] ?? null,
                    'description' => $descriptions[$index] ?? null,
                    'hash' => $fileHash,
                    'is_optimized' => false,
                    'is_public' => $isPublicFlags[$index] ?? false,
                    'download_count' => 0,
                ]);

                $uploadedFiles[] = [
                    'success' => true,
                    'file' => $mediaFile
                ];

            } catch (\Exception $e) {
                $uploadedFiles[] = [
                    'success' => false,
                    'message' => 'Upload failed: ' . $e->getMessage(),
                    'original_name' => $file->getClientOriginalName()
                ];
            }
        }

        $successCount = collect($uploadedFiles)->where('success', true)->count();
        $failureCount = collect($uploadedFiles)->where('success', false)->count();

        return response()->json([
            'success' => $successCount > 0,
            'message' => "Uploaded {$successCount} files successfully" . 
                        ($failureCount > 0 ? ", {$failureCount} failed" : ""),
            'data' => $uploadedFiles,
            'summary' => [
                'total' => count($uploadedFiles),
                'successful' => $successCount,
                'failed' => $failureCount
            ]
        ], $successCount > 0 ? 201 : 422);
    }

    public function show(Request $request, MediaFile $file): JsonResponse
    {
        // Ensure the file belongs to the authenticated user
        if ($file->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $file
        ]);
    }

    public function update(Request $request, MediaFile $file): JsonResponse
    {
        // Ensure the file belongs to the authenticated user
        if ($file->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
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
                'errors' => $validator->errors()
            ], 422);
        }

        $file->update($request->only(['alt_text', 'description', 'is_public']));

        return response()->json([
            'success' => true,
            'data' => $file->fresh()
        ]);
    }

    public function destroy(Request $request, MediaFile $file): JsonResponse
    {
        // Ensure the file belongs to the authenticated user
        if ($file->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }

        try {
            // Delete the actual file from storage
            if (Storage::disk($file->disk)->exists($file->path)) {
                Storage::disk($file->disk)->delete($file->path);
            }

            // Delete the database record
            $file->delete();

            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete file: ' . $e->getMessage()
            ], 500);
        }
    }

    public function download(Request $request, MediaFile $file): \Symfony\Component\HttpFoundation\Response
    {
        // Ensure the file belongs to the authenticated user or is public
        if ($file->user_id !== $request->user()->id && !$file->is_public) {
            return response()->json([
                'success' => false,
                'message' => 'File not found'
            ], 404);
        }

        // Check if file exists in storage
        if (!Storage::disk($file->disk)->exists($file->path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found in storage'
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
