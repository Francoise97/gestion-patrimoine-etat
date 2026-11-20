<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use App\Support\PatrimoineClient;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Maintenance::query();

        foreach (['bien_id', 'statut'] as $filtre) {
            if ($request->filled($filtre)) {
                $query->where($filtre, $request->query($filtre));
            }
        }

        return response()->json($query->orderByDesc('id')->paginate(15));
    }

    // Tout utilisateur connecté peut signaler une panne
    public function store(Request $request, PatrimoineClient $patrimoine)
    {
        $data = $request->validate([
            'bien_id' => 'required|integer',
            'description' => 'required|string',
        ]);

        if (! $patrimoine->bien($data['bien_id'], $request->bearerToken())) {
            return response()->json(['message' => 'Bien introuvable'], 404);
        }

        $maintenance = Maintenance::create($data + [
            'utilisateur_id' => $request->attributes->get('auth_user')['id'],
            'date_signalement' => now()->toDateString(),
        ]);

        return response()->json($maintenance, 201);
    }

    public function update(Request $request, Maintenance $maintenance)
    {
        $data = $request->validate(['statut' => ['required', Rule::in(Maintenance::STATUTS)]]);
        $maintenance->update($data);

        return response()->json($maintenance);
    }
}