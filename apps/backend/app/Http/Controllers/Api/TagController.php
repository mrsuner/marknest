<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tag\StoreTagRequest;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TagController extends Controller
{
    /**
     * List all tags for the authenticated user
     *
     * Returns all tags owned by the current user, ordered by name.
     *
     * @group Tags
     *
     * @authenticated
     *
     * @response 200 scenario="Success" {
     *   "data": [
     *     {
     *       "id": "01HQ...",
     *       "name": "javascript",
     *       "slug": "javascript"
     *     },
     *     {
     *       "id": "01HR...",
     *       "name": "tutorial",
     *       "slug": "tutorial"
     *     }
     *   ]
     * }
     */
    public function index(Request $request): JsonResponse
    {
        $tags = $request->user()
            ->tags()
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        return response()->json([
            'data' => $tags,
        ]);
    }

    /**
     * Create a new tag
     *
     * Creates a new tag for the authenticated user.
     *
     * @group Tags
     *
     * @authenticated
     *
     * @bodyParam name string required The tag name (max 50 characters). Example: javascript
     *
     * @response 201 scenario="Created" {
     *   "id": "01HQ...",
     *   "name": "javascript",
     *   "slug": "javascript"
     * }
     * @response 422 scenario="Duplicate Tag" {
     *   "message": "The given data was invalid.",
     *   "errors": {
     *     "name": ["You already have a tag with this name."]
     *   }
     * }
     */
    public function store(StoreTagRequest $request): JsonResponse
    {
        $tag = Tag::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ]);

        return response()->json([
            'id' => $tag->id,
            'name' => $tag->name,
            'slug' => $tag->slug,
        ], 201);
    }

    /**
     * Delete a tag
     *
     * Deletes a tag owned by the authenticated user. This will also remove
     * the tag association from all documents.
     *
     * @group Tags
     *
     * @authenticated
     *
     * @urlParam tag string required The tag ID. Example: 01HQ...
     *
     * @response 200 scenario="Deleted" {
     *   "message": "Tag deleted successfully"
     * }
     * @response 404 scenario="Not Found" {
     *   "message": "Tag not found"
     * }
     */
    public function destroy(Request $request, string $tagId): JsonResponse
    {
        $tag = Tag::where('id', $tagId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $tag) {
            return response()->json([
                'message' => 'Tag not found',
            ], 404);
        }

        // Detach from all documents first
        $tag->documents()->detach();

        $tag->delete();

        return response()->json([
            'message' => 'Tag deleted successfully',
        ]);
    }
}
