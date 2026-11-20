<?php

namespace App\Http\Controllers;

use App\Models\Affectation;
use App\Support\PatrimoineClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AffectationController extends Controller
{
    public function index(Request $request)
    {
        $query = Affectation::with('service');

        foreach (['bien_id', 'service_id'] as $filtre) {
            if ($request->filled($filtre)) {
                $query->where($filtre, $request->query($filtre));
            }
        }
        if ($request->boolean('en_cours')) {
            $query->whereNull('date_fin');
        }

        return response()->json($query->orderByDesc('id')->paginate(15));
    }

    // Affecter un bien à un service, ou le transférer d'un service à un autre
    public function store(Request $request, PatrimoineClient $patrimoine)
    {
        $data = $request->validate([
            'bien_id' => 'required|integer',
            'service_id' => 'required|exists:services,id',
            'motif' => 'nullable|string|max:255',
            'date_debut' => 'nullable|date',
        ]);

        $bien = $patrimoine->bien($data['bien_id'], $request->bearerToken());

        if (! $bien) {
            return response()->json(['message' => 'Bien introuvable'], 404);
        }
        if ($bien['statut'] !== 'en_service') {
            return response()->json(['message' => 'Un bien réformé ou cédé ne peut plus être affecté'], 422);
        }

        $courante = Affectation::where('bien_id', $data['bien_id'])->whereNull('date_fin')->first();

        if ($courante && (int) $courante->service_id === (int) $data['service_id']) {
            return response()->json(['message' => 'Ce bien est déjà affecté à ce service'], 422);
        }

        $debut = $data['date_debut'] ?? now()->toDateString();
        $auteur = $request->attributes->get('auth_user')['id'];

        $affectation = DB::transaction(function () use ($data, $debut, $auteur) {
            Affectation::where('bien_id', $data['bien_id'])->whereNull('date_fin')->update(['date_fin' => $debut]);

            return Affectation::create([
                'bien_id' => $data['bien_id'],
                'service_id' => $data['service_id'],
                'utilisateur_id' => $auteur,
                'date_debut' => $debut,
                'motif' => $data['motif'] ?? null,
            ]);
        });

        return response()->json($affectation->load('service'), 201);
    }

    public function historique(int $bienId)
    {
        return response()->json(
            Affectation::with('service')->where('bien_id', $bienId)
                ->orderByDesc('date_debut')->orderByDesc('id')->get()
        );
    }

    // Réformer ou céder un bien : il ne pourra plus être affecté
    public function sortie(Request $request, int $bienId, PatrimoineClient $patrimoine)
    {
        $data = $request->validate([
            'statut' => ['required', Rule::in(['reforme', 'cede'])],
        ]);

        $bien = $patrimoine->bien($bienId, $request->bearerToken());

        if (! $bien) {
            return response()->json(['message' => 'Bien introuvable'], 404);
        }
        if ($bien['statut'] !== 'en_service') {
            return response()->json(['message' => 'Ce bien est déjà sorti du parc'], 422);
        }
        if (! $patrimoine->changerStatut($bien, $data['statut'], $request->bearerToken())) {
            return response()->json(['message' => 'Mise à jour du bien impossible'], 502);
        }

        Affectation::where('bien_id', $bienId)->whereNull('date_fin')->update(['date_fin' => now()->toDateString()]);

        return response()->json(['message' => 'Bien sorti du parc', 'statut' => $data['statut']]);
    }
}