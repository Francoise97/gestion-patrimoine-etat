<?php

namespace App\Http\Controllers;

use App\Models\Bien;
use App\Models\Demande;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class DemandeController extends Controller
{
    // L'administrateur voit toutes les demandes, les autres seulement les leurs
    public function index(Request $request)
    {
        $user = $request->attributes->get('auth_user');
        $query = Demande::with('categorie');

        if ($user['role'] !== 'admin') {
            $query->where('demandeur_id', $user['id']);
        }
        if ($request->filled('statut')) {
            $query->where('statut', $request->query('statut'));
        }

        return response()->json($query->orderByDesc('id')->paginate(15));
    }

    public function compte()
    {
        return response()->json(['en_attente' => Demande::where('statut', 'en_attente')->count()]);
    }

    // Un client propose un bien : rien n'est enregistré dans l'inventaire
    public function store(Request $request)
    {
        $user = $request->attributes->get('auth_user');

        $data = $request->validate([
            'code_inventaire' => ['required', 'string', 'max:50', Rule::unique('biens', 'code_inventaire')],
            'designation' => 'required|string|max:255',
            'categorie_id' => 'required|exists:categories,id',
            'valeur' => 'required|numeric|min:0',
            'date_acquisition' => 'nullable|date',
            'localisation' => 'nullable|string|max:255',
            'etat' => ['required', Rule::in(Bien::ETATS)],
        ]);

        $demande = Demande::create($data + [
            'demandeur_id' => $user['id'],
            'demandeur_nom' => $user['name'],
        ]);

        return response()->json($demande->load('categorie'), 201);
    }

    // L'administrateur revoit les données (il peut les corriger) puis enregistre le bien
    public function approuver(Request $request, Demande $demande)
    {
        if ($demande->statut !== 'en_attente') {
            return response()->json(['message' => 'Cette demande a déjà été traitée'], 422);
        }

        $corrections = $request->validate([
            'code_inventaire' => ['sometimes', 'required', 'string', 'max:50'],
            'designation' => 'sometimes|required|string|max:255',
            'categorie_id' => 'sometimes|required|exists:categories,id',
            'valeur' => 'sometimes|required|numeric|min:0',
            'date_acquisition' => 'nullable|date',
            'localisation' => 'nullable|string|max:255',
            'etat' => ['sometimes', 'required', Rule::in(Bien::ETATS)],
        ]);

        $donnees = array_merge($demande->only([
            'code_inventaire', 'designation', 'categorie_id', 'valeur',
            'date_acquisition', 'localisation', 'etat',
        ]), $corrections);

        if (Bien::where('code_inventaire', $donnees['code_inventaire'])->exists()) {
            return response()->json(['message' => 'Un bien porte déjà ce code d\'inventaire'], 422);
        }

        $bien = DB::transaction(function () use ($demande, $donnees) {
            $bien = Bien::create($donnees + ['statut' => 'en_service']);

            $demande->update($donnees + [
                'statut' => 'approuvee',
                'bien_id' => $bien->id,
                'motif_rejet' => null,
                'traite_le' => now(),
            ]);

            return $bien;
        });

        return response()->json(['demande' => $demande->load('categorie'), 'bien' => $bien]);
    }
    public function rejeter(Request $request, Demande $demande)
    {
        if ($demande->statut !== 'en_attente') {
            return response()->json(['message' => 'Cette demande a déjà été traitée'], 422);
        }

        $data = $request->validate(['motif_rejet' => 'nullable|string|max:255']);

        $demande->update([
            'statut' => 'rejetee',
            'motif_rejet' => $data['motif_rejet'] ?? null,
            'traite_le' => now(),
        ]);

        return response()->json($demande->load('categorie'));
    }
}