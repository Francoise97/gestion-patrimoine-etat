<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    // Inscription publique : le compte créé a toujours le rôle "agent"
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create($data + ['role' => 'agent']);
        $token = $user->createToken('api')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Identifiants incorrects'], 401);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // Réservé à l'administrateur
    public function users(Request $request)
    {
        $this->onlyAdmin($request);

        return response()->json(User::orderBy('name')->get());
    }

    // Réservé à l'administrateur : crée un utilisateur avec le rôle voulu
    public function storeUser(Request $request)
    {
        $this->onlyAdmin($request);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(User::ROLES)],
            'service_id' => 'nullable|integer',
        ]);

        return response()->json(User::create($data), 201);
    }

    private function onlyAdmin(Request $request): void
    {
        abort_unless($request->user()->role === 'admin', 403, 'Accès réservé à l\'administrateur');
    }
}