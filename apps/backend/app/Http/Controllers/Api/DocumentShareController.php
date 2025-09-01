<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentShare;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DocumentShareController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DocumentShare::with(['document', 'user'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc');

        // Search by document title
        if ($search = $request->get('search')) {
            $query->whereHas('document', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->get('status')) {
            switch ($status) {
                case 'active':
                    $query->active()->notExpired();
                    break;
                case 'inactive':
                    $query->where('is_active', false);
                    break;
                case 'expired':
                    $query->where('expires_at', '<', now());
                    break;
            }
        }

        // Filter by access level
        if ($accessLevel = $request->get('access_level')) {
            $query->where('access_level', $accessLevel);
        }

        $shares = $query->paginate($request->get('per_page', 15));

        return response()->json($shares);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'document_id' => 'required|exists:documents,id',
            'password' => 'nullable|string|min:4|max:50',
            'expires_at' => 'nullable|date|after:now',
            'max_views' => 'nullable|integer|min:1|max:10000',
            'allow_download' => 'boolean',
            'allow_copy' => 'boolean',
            'show_watermark' => 'boolean',
            'access_level' => 'required|in:public,password,email_list',
            'allowed_emails' => 'nullable|array',
            'allowed_emails.*' => 'email',
            'description' => 'nullable|string|max:255',
        ]);

        // Check if user owns the document
        $document = Document::where('id', $validated['document_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Generate unique share token
        $shareToken = $this->generateUniqueShareToken();

        $share = DocumentShare::create([
            'document_id' => $validated['document_id'],
            'user_id' => Auth::id(),
            'share_token' => $shareToken,
            'short_url' => $this->generateShortUrl($shareToken),
            'password' => isset($validated['password']) ? bcrypt($validated['password']) : null,
            'expires_at' => $validated['expires_at'] ?? null,
            'max_views' => $validated['max_views'] ?? null,
            'view_count' => 0,
            'allow_download' => $validated['allow_download'] ?? true,
            'allow_copy' => $validated['allow_copy'] ?? true,
            'show_watermark' => $validated['show_watermark'] ?? false,
            'access_level' => $validated['access_level'],
            'allowed_emails' => $validated['allowed_emails'] ?? null,
            'access_log' => [],
            'is_active' => true,
            'description' => $validated['description'] ?? null,
        ]);

        $share->load(['document', 'user']);

        return response()->json($share, 201);
    }

    public function show(string $id): JsonResponse
    {
        $share = DocumentShare::with(['document', 'user'])
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return response()->json($share);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $share = DocumentShare::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'password' => 'nullable|string|min:4|max:50',
            'expires_at' => 'nullable|date|after:now',
            'max_views' => 'nullable|integer|min:1|max:10000',
            'allow_download' => 'boolean',
            'allow_copy' => 'boolean',
            'show_watermark' => 'boolean',
            'access_level' => 'in:public,password,email_list',
            'allowed_emails' => 'nullable|array',
            'allowed_emails.*' => 'email',
            'is_active' => 'boolean',
            'description' => 'nullable|string|max:255',
        ]);

        // Handle password update
        if (isset($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        }

        $share->update($validated);
        $share->load(['document', 'user']);

        return response()->json($share);
    }

    public function destroy(string $id): JsonResponse
    {
        $share = DocumentShare::where('user_id', Auth::id())->findOrFail($id);
        $share->delete();

        return response()->json(['message' => 'Share deleted successfully']);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'share_ids' => 'required|array',
            'share_ids.*' => 'exists:document_shares,id',
            'action' => 'required|in:activate,deactivate,delete',
        ]);

        $query = DocumentShare::whereIn('id', $validated['share_ids'])
            ->where('user_id', Auth::id());

        switch ($validated['action']) {
            case 'activate':
                $query->update(['is_active' => true]);
                break;
            case 'deactivate':
                $query->update(['is_active' => false]);
                break;
            case 'delete':
                $query->delete();
                break;
        }

        return response()->json(['message' => 'Bulk action completed successfully']);
    }

    public function toggle(string $id): JsonResponse
    {
        $share = DocumentShare::where('user_id', Auth::id())->findOrFail($id);
        $share->update(['is_active' => !$share->is_active]);
        $share->load(['document', 'user']);

        return response()->json($share);
    }

    public function analytics(string $id): JsonResponse
    {
        $share = DocumentShare::where('user_id', Auth::id())->findOrFail($id);
        
        $analytics = [
            'total_views' => $share->view_count,
            'remaining_views' => $share->max_views ? ($share->max_views - $share->view_count) : null,
            'is_expired' => $share->expires_at && $share->expires_at->isPast(),
            'days_until_expiry' => $share->expires_at ? now()->diffInDays($share->expires_at, false) : null,
            'access_log' => array_slice($share->access_log ?? [], -10), // Last 10 access logs
            'created_at' => $share->created_at,
            'last_accessed_at' => $this->getLastAccessedAt($share),
        ];

        return response()->json($analytics);
    }

    public function publicView(Request $request, string $shareToken): JsonResponse
    {
        $share = DocumentShare::with(['document', 'user'])
            ->where('share_token', $shareToken)
            ->active()
            ->notExpired()
            ->firstOrFail();

        // Check if password is required
        if ($share->access_level === 'password' && $share->password) {
            $providedPassword = $request->query('password') ?? $request->input('password');
            
            if (!$providedPassword) {
                return response()->json(['message' => 'Password required'], 401);
            }

            if (!password_verify($providedPassword, $share->password)) {
                return response()->json(['message' => 'Invalid password'], 403);
            }
        }

        // Check email list restriction
        if ($share->access_level === 'email_list' && !empty($share->allowed_emails)) {
            $userEmail = $request->query('email') ?? $request->input('email');
            
            if (!$userEmail || !in_array($userEmail, $share->allowed_emails)) {
                return response()->json(['message' => 'Access restricted to specific emails'], 403);
            }
        }

        // Check view limit
        if ($share->max_views && $share->view_count >= $share->max_views) {
            return response()->json(['message' => 'View limit exceeded'], 429);
        }

        // Increment view count and log access
        $this->logAccess($share);

        return response()->json([
            'document' => [
                'id' => $share->document->id,
                'title' => $share->document->title,
                'content' => $share->document->content,
                'rendered_html' => $share->document->rendered_html,
            ],
            'share_settings' => [
                'allow_download' => $share->allow_download,
                'allow_copy' => $share->allow_copy,
                'show_watermark' => $share->show_watermark,
            ],
            'owner' => [
                'name' => $share->user->name,
            ],
        ]);
    }

    private function generateUniqueShareToken(): string
    {
        do {
            $token = Str::random(12);
        } while (DocumentShare::where('share_token', $token)->exists());

        return $token;
    }

    private function generateShortUrl(string $token): string
    {
        // In production, you might want to use a proper URL shortener
        return config('app.url') . '/s/' . $token;
    }

    private function logAccess(DocumentShare $share): void
    {
        $share->increment('view_count');
        
        $accessLog = $share->access_log ?? [];
        $accessLog[] = [
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ];

        // Keep only last 100 access logs
        if (count($accessLog) > 100) {
            $accessLog = array_slice($accessLog, -100);
        }

        $share->update(['access_log' => $accessLog]);
    }

    private function getLastAccessedAt(DocumentShare $share): ?string
    {
        $accessLog = $share->access_log ?? [];
        return !empty($accessLog) ? end($accessLog)['timestamp'] : null;
    }

    public function findActiveShareByDocument(string $documentId): JsonResponse
    {
        $share = DocumentShare::where('document_id', $documentId)
            ->whereIn('access_level', ['public', 'read']) // Support both public and read access levels
            ->active()
            ->notExpired()
            ->first();

        if (!$share) {
            return response()->json(['message' => 'No active public share found'], 404);
        }

        return response()->json([
            'share_token' => $share->share_token,
            'is_active' => $share->is_active,
            'access_level' => $share->access_level,
        ]);
    }
}
