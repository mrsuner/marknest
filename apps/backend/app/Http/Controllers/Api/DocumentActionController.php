<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DocumentActionController extends Controller
{
    /**
     * Toggle favorite status for a single document
     * Toggles the is_favorite boolean field for the specified document
     * Returns the updated document with new favorite status
     */
    public function toggleFavorite(Request $request, Document $document): JsonResponse
    {
        $user = Auth::user();
        
        // Ensure the document belongs to the user
        if ($document->user_id !== $user->id) {
            return response()->json([
                'message' => 'Document not found'
            ], 404);
        }
        
        // Toggle the favorite status
        $document->update([
            'is_favorite' => !$document->is_favorite
        ]);
        
        return response()->json([
            'data' => [
                'id' => $document->id,
                'is_favorite' => $document->is_favorite,
                'title' => $document->title,
            ],
            'message' => $document->is_favorite 
                ? 'Document added to favorites' 
                : 'Document removed from favorites'
        ]);
    }
    
    /**
     * Toggle favorite status for multiple documents
     * Accepts an array of document IDs and a favorite status
     * Updates all specified documents to the given favorite status
     */
    public function bulkToggleFavorite(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'document_ids' => 'required|array|min:1',
            'document_ids.*' => 'required|string|exists:documents,id',
            'is_favorite' => 'required|boolean'
        ]);
        
        $documentIds = $validated['document_ids'];
        $isFavorite = $validated['is_favorite'];
        
        // Update documents that belong to the user
        $updatedCount = Document::whereIn('id', $documentIds)
            ->where('user_id', $user->id)
            ->update(['is_favorite' => $isFavorite]);
            
        if ($updatedCount === 0) {
            return response()->json([
                'message' => 'No documents were updated. Please check document ownership.'
            ], 404);
        }
        
        return response()->json([
            'data' => [
                'updated_count' => $updatedCount,
                'is_favorite' => $isFavorite,
                'document_ids' => $documentIds
            ],
            'message' => $isFavorite 
                ? "Added {$updatedCount} document(s) to favorites"
                : "Removed {$updatedCount} document(s) from favorites"
        ]);
    }
    
    /**
     * Toggle archive status for a single document
     * Toggles the is_archived boolean field for the specified document
     * Returns the updated document with new archive status
     */
    public function toggleArchive(Request $request, Document $document): JsonResponse
    {
        $user = Auth::user();
        
        // Ensure the document belongs to the user
        if ($document->user_id !== $user->id) {
            return response()->json([
                'message' => 'Document not found'
            ], 404);
        }
        
        // Toggle the archive status
        $document->update([
            'is_archived' => !$document->is_archived
        ]);
        
        return response()->json([
            'data' => [
                'id' => $document->id,
                'is_archived' => $document->is_archived,
                'title' => $document->title,
            ],
            'message' => $document->is_archived 
                ? 'Document archived' 
                : 'Document unarchived'
        ]);
    }
    
    /**
     * Bulk toggle archive status for multiple documents
     */
    public function bulkToggleArchive(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'document_ids' => 'required|array|min:1',
            'document_ids.*' => 'required|string|exists:documents,id',
            'is_archived' => 'required|boolean'
        ]);
        
        $documentIds = $validated['document_ids'];
        $isArchived = $validated['is_archived'];
        
        // Update documents that belong to the user
        $updatedCount = Document::whereIn('id', $documentIds)
            ->where('user_id', $user->id)
            ->update(['is_archived' => $isArchived]);
            
        if ($updatedCount === 0) {
            return response()->json([
                'message' => 'No documents were updated. Please check document ownership.'
            ], 404);
        }
        
        return response()->json([
            'data' => [
                'updated_count' => $updatedCount,
                'is_archived' => $isArchived,
                'document_ids' => $documentIds
            ],
            'message' => $isArchived 
                ? "Archived {$updatedCount} document(s)"
                : "Unarchived {$updatedCount} document(s)"
        ]);
    }
}