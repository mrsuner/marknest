<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Folder;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class FolderController extends Controller
{
    /**
     * Get folder tree structure for current user
     * Returns nested folders with document counts
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        // Get root folders with nested children and document counts
        $folders = Folder::where('user_id', $user->id)
            ->whereNull('parent_id')
            ->with(['children', 'documents'])
            ->withCount('documents')
            ->orderBy('order')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $folders,
            'message' => 'Folders retrieved successfully'
        ]);
    }

    /**
     * Get single folder with its contents
     * Returns folder details, subfolders, and documents
     */
    public function show(string $folderId): JsonResponse
    {
        $user = Auth::user();
        
        $folder = Folder::where('user_id', $user->id)
            ->where('id', $folderId)
            ->with(['children', 'documents', 'parent'])
            ->withCount('documents')
            ->firstOrFail();

        // Get breadcrumb path
        $breadcrumbs = $this->getBreadcrumbPath($folder);

        return response()->json([
            'data' => [
                'folder' => $folder,
                'breadcrumbs' => $breadcrumbs,
            ],
            'message' => 'Folder retrieved successfully'
        ]);
    }

    /**
     * Get folder contents (children folders and documents)
     * Used for folder navigation in the UI
     */
    public function getContents(Request $request, string $folderId = null): JsonResponse
    {
        $user = Auth::user();
        $searchQuery = $request->get('search', '');
        $sortBy = $request->get('sort', 'name');
        $sortOrder = $request->get('order', 'asc');

        // Build query for folders
        $foldersQuery = Folder::where('user_id', $user->id)
            ->withCount('documents');

        // Build query for documents
        $documentsQuery = Document::where('user_id', $user->id)
            ->whereNull('deleted_at');

        if ($folderId) {
            // Get specific folder contents
            $parentFolder = Folder::where('user_id', $user->id)
                ->where('id', $folderId)
                ->firstOrFail();
                
            $foldersQuery->where('parent_id', $folderId);
            $documentsQuery->where('folder_id', $folderId);
            
            $breadcrumbs = $this->getBreadcrumbPath($parentFolder);
        } else {
            // Get root level contents
            $foldersQuery->whereNull('parent_id');
            $documentsQuery->whereNull('folder_id');
            
            $breadcrumbs = [
                ['id' => 'root', 'name' => 'My Drive', 'path' => '/']
            ];
        }

        // Apply search filter
        if ($searchQuery) {
            $foldersQuery->where('name', 'like', "%{$searchQuery}%");
            $documentsQuery->where('title', 'like', "%{$searchQuery}%");
        }

        // Apply sorting
        $foldersQuery->orderBy($sortBy === 'modified' ? 'updated_at' : $sortBy, $sortOrder);
        $documentsQuery->orderBy($sortBy === 'modified' ? 'updated_at' : ($sortBy === 'name' ? 'title' : $sortBy), $sortOrder);

        $folders = $foldersQuery->get();
        $documents = $documentsQuery->get();

        // Combine and format items for frontend
        $items = collect();
        
        // Add folders
        foreach ($folders as $folder) {
            $items->push([
                'id' => $folder->id,
                'name' => $folder->name,
                'type' => 'folder',
                'modified' => $folder->updated_at->diffForHumans(),
                'documentCount' => $folder->documents_count,
                'color' => $folder->color,
                'icon' => $folder->icon,
            ]);
        }
        
        // Add documents
        foreach ($documents as $document) {
            $items->push([
                'id' => $document->id,
                'name' => $document->title,
                'type' => 'document',
                'size' => $this->formatFileSize($document->word_count * 5), // Approximate bytes
                'modified' => $document->updated_at->diffForHumans(),
                'shared' => $document->shares()->exists(),
                'favorite' => $document->is_favorite,
            ]);
        }

        return response()->json([
            'data' => [
                'items' => $items,
                'breadcrumbs' => $breadcrumbs,
                'currentFolder' => $folderId ? $parentFolder : null,
            ],
            'message' => 'Folder contents retrieved successfully'
        ]);
    }

    /**
     * Create new folder
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:folders,id',
            'description' => 'nullable|string|max:500',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:50',
        ]);

        $user = Auth::user();

        // Verify parent folder ownership if provided
        if ($validated['parent_id']) {
            $parentFolder = Folder::where('user_id', $user->id)
                ->where('id', $validated['parent_id'])
                ->firstOrFail();
                
            $depth = $parentFolder->depth + 1;
            $path = $parentFolder->path . '/' . Str::slug($validated['name']);
        } else {
            $depth = 0;
            $path = '/' . Str::slug($validated['name']);
        }

        // Check for duplicate names at same level
        $existingFolder = Folder::where('user_id', $user->id)
            ->where('parent_id', $validated['parent_id'] ?? null)
            ->where('name', $validated['name'])
            ->first();

        if ($existingFolder) {
            return response()->json([
                'message' => 'A folder with this name already exists at this location'
            ], 422);
        }

        $folder = Folder::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'user_id' => $user->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'path' => $path,
            'depth' => $depth,
            'order' => 0,
            'color' => $validated['color'] ?? null,
            'icon' => $validated['icon'] ?? null,
        ]);

        return response()->json([
            'data' => $folder,
            'message' => 'Folder created successfully'
        ], 201);
    }

    /**
     * Update folder
     */
    public function update(Request $request, string $folderId): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:500',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:50',
        ]);

        $user = Auth::user();
        
        $folder = Folder::where('user_id', $user->id)
            ->where('id', $folderId)
            ->firstOrFail();

        // Check for duplicate names at same level if name is being changed
        if (isset($validated['name']) && $validated['name'] !== $folder->name) {
            $existingFolder = Folder::where('user_id', $user->id)
                ->where('parent_id', $folder->parent_id)
                ->where('name', $validated['name'])
                ->where('id', '!=', $folderId)
                ->first();

            if ($existingFolder) {
                return response()->json([
                    'message' => 'A folder with this name already exists at this location'
                ], 422);
            }

            $validated['slug'] = Str::slug($validated['name']);
            
            // Update path if name changed
            $this->updateFolderPaths($folder, $validated['name']);
        }

        $folder->update($validated);

        return response()->json([
            'data' => $folder->fresh(),
            'message' => 'Folder updated successfully'
        ]);
    }

    /**
     * Move folder to different parent
     */
    public function move(Request $request, string $folderId): JsonResponse
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:folders,id',
        ]);

        $user = Auth::user();
        
        $folder = Folder::where('user_id', $user->id)
            ->where('id', $folderId)
            ->firstOrFail();

        // Prevent moving folder into itself or its descendants
        if ($validated['parent_id']) {
            $newParent = Folder::where('user_id', $user->id)
                ->where('id', $validated['parent_id'])
                ->firstOrFail();

            if ($this->isDescendantOf($newParent, $folder)) {
                return response()->json([
                    'message' => 'Cannot move folder into itself or its subfolders'
                ], 422);
            }

            $depth = $newParent->depth + 1;
            $path = $newParent->path . '/' . $folder->slug;
        } else {
            $depth = 0;
            $path = '/' . $folder->slug;
        }

        // Update folder and all descendants
        $folder->parent_id = $validated['parent_id'] ?? null;
        $folder->depth = $depth;
        $folder->path = $path;
        $folder->save();

        $this->updateDescendantPaths($folder);

        return response()->json([
            'data' => $folder->fresh(),
            'message' => 'Folder moved successfully'
        ]);
    }

    /**
     * Delete folder
     * Soft deletes folder and optionally moves contents
     */
    public function destroy(Request $request, string $folderId): JsonResponse
    {
        $user = Auth::user();
        
        $folder = Folder::where('user_id', $user->id)
            ->where('id', $folderId)
            ->withCount(['children', 'documents'])
            ->firstOrFail();

        // Check if folder has contents
        if ($folder->children_count > 0 || $folder->documents_count > 0) {
            $action = $request->get('action', 'abort');
            
            if ($action === 'abort') {
                return response()->json([
                    'message' => 'Folder contains items. Please specify action: move_to_parent or delete_all',
                    'data' => [
                        'children_count' => $folder->children_count,
                        'documents_count' => $folder->documents_count,
                    ]
                ], 422);
            }
            
            if ($action === 'move_to_parent') {
                // Move contents to parent folder
                Folder::where('parent_id', $folderId)
                    ->update(['parent_id' => $folder->parent_id]);
                    
                Document::where('folder_id', $folderId)
                    ->update(['folder_id' => $folder->parent_id]);
            } elseif ($action === 'delete_all') {
                // Recursively delete all contents
                $this->deleteRecursive($folder);
            }
        }

        $folder->delete();

        return response()->json([
            'message' => 'Folder deleted successfully'
        ]);
    }

    /**
     * Get folder breadcrumb navigation
     */
    public function getBreadcrumbs(string $folderId): JsonResponse
    {
        $user = Auth::user();
        
        $folder = Folder::where('user_id', $user->id)
            ->where('id', $folderId)
            ->firstOrFail();

        $breadcrumbs = $this->getBreadcrumbPath($folder);

        return response()->json([
            'data' => $breadcrumbs,
            'message' => 'Breadcrumbs retrieved successfully'
        ]);
    }

    /**
     * Search folders and documents
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => 'required|string|min:2',
            'type' => 'nullable|in:all,folders,documents',
        ]);

        $user = Auth::user();
        $query = $validated['query'];
        $type = $validated['type'] ?? 'all';
        
        $results = collect();

        if ($type === 'all' || $type === 'folders') {
            $folders = Folder::where('user_id', $user->id)
                ->where('name', 'like', "%{$query}%")
                ->limit(20)
                ->get()
                ->map(function ($folder) {
                    return [
                        'id' => $folder->id,
                        'name' => $folder->name,
                        'type' => 'folder',
                        'path' => $folder->path,
                        'modified' => $folder->updated_at->diffForHumans(),
                    ];
                });
            
            $results = $results->concat($folders);
        }

        if ($type === 'all' || $type === 'documents') {
            $documents = Document::where('user_id', $user->id)
                ->whereNull('deleted_at')
                ->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('content', 'like', "%{$query}%");
                })
                ->limit(20)
                ->get()
                ->map(function ($document) {
                    return [
                        'id' => $document->id,
                        'name' => $document->title,
                        'type' => 'document',
                        'folder_id' => $document->folder_id,
                        'size' => $this->formatFileSize($document->word_count * 5),
                        'modified' => $document->updated_at->diffForHumans(),
                    ];
                });
            
            $results = $results->concat($documents);
        }

        return response()->json([
            'data' => $results,
            'message' => "Found {$results->count()} results"
        ]);
    }

    /**
     * Helper: Get breadcrumb path for folder
     */
    private function getBreadcrumbPath(Folder $folder): array
    {
        $breadcrumbs = [];
        $current = $folder;

        while ($current) {
            array_unshift($breadcrumbs, [
                'id' => $current->id,
                'name' => $current->name,
                'path' => $current->path,
            ]);
            $current = $current->parent;
        }

        array_unshift($breadcrumbs, [
            'id' => 'root',
            'name' => 'My Drive',
            'path' => '/',
        ]);

        return $breadcrumbs;
    }

    /**
     * Helper: Update folder paths when renamed
     */
    private function updateFolderPaths(Folder $folder, string $newName): void
    {
        $newSlug = Str::slug($newName);
        $oldPath = $folder->path;
        
        if ($folder->parent_id) {
            $parent = Folder::find($folder->parent_id);
            $newPath = $parent->path . '/' . $newSlug;
        } else {
            $newPath = '/' . $newSlug;
        }

        $folder->path = $newPath;
        
        // Update all descendant paths
        $descendants = Folder::where('path', 'like', $oldPath . '/%')->get();
        foreach ($descendants as $descendant) {
            $descendant->path = str_replace($oldPath, $newPath, $descendant->path);
            $descendant->save();
        }
    }

    /**
     * Helper: Update descendant paths after move
     */
    private function updateDescendantPaths(Folder $folder): void
    {
        $descendants = Folder::where('path', 'like', $folder->path . '/%')->get();
        
        foreach ($descendants as $descendant) {
            $relativePath = substr($descendant->path, strlen($folder->path));
            $descendant->path = $folder->path . $relativePath;
            $descendant->depth = $folder->depth + substr_count($relativePath, '/');
            $descendant->save();
        }
    }

    /**
     * Helper: Check if folder is descendant of another
     */
    private function isDescendantOf(Folder $potentialDescendant, Folder $folder): bool
    {
        $current = $potentialDescendant;
        
        while ($current) {
            if ($current->id === $folder->id) {
                return true;
            }
            $current = $current->parent;
        }
        
        return false;
    }

    /**
     * Helper: Recursively delete folder contents
     */
    private function deleteRecursive(Folder $folder): void
    {
        // Delete all documents in this folder
        Document::where('folder_id', $folder->id)->delete();
        
        // Recursively delete child folders
        $children = Folder::where('parent_id', $folder->id)->get();
        foreach ($children as $child) {
            $this->deleteRecursive($child);
            $child->delete();
        }
    }

    /**
     * Helper: Format file size
     */
    private function formatFileSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        
        return round($bytes, 1) . ' ' . $units[$i];
    }
}