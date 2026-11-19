<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class VerifyToken
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        $url = rtrim(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001'), '/') . '/api/auth/me';

        try {
            $response = Http::withToken($token)->acceptJson()->timeout(5)->get($url);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Service d\'authentification indisponible'], 503);
        }

        if ($response->failed()) {
            return response()->json(['message' => 'Token invalide'], 401);
        }

        $user = $response->json();

        if ($roles && ! in_array($user['role'] ?? '', $roles, true)) {
            return response()->json(['message' => 'Accès refusé pour votre rôle'], 403);
        }

        $request->attributes->set('auth_user', $user);

        return $next($request);
    }
}