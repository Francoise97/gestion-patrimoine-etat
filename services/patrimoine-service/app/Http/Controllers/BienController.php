<?php

namespace App\Http\Controllers;

use App\Models\Bien;
use App\Models\Categorie;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BienController extends Controller
{
    public function index(Request $request)
    {
        $query = Bien::with('categorie');

        if ($search = $request->query('search')) {
            $query->whereRaw('LOWER(designation) LIKE ?', ['%' . strtolower($search) . '%']);
        }
        foreach (['categorie_id', 'etat', 'statut'] as $filtre) {
            if ($request->filled($filtre)) {
                $query->where($filtre, $request->query($filtre));
            }
        }

        return response()->json($query->orderByDesc('id')->paginate(15));
    }

    public function show(Bien $bien)
    {
        return response()->json($bien->load('categorie'));
    }

    public function store(Request $request)
    {
        $bien = Bien::create($this->validated($request));

        return response()->json($bien->load('categorie'), 201);
    }

    public function update(Request $request, Bien $bien)
    {
        $bien->update($this->validated($request, $bien));

        return response()->json($bien->load('categorie'));
    }

    public function destroy(Bien $bien)
    {
        $bien->delete();

        return response()->json(null, 204);
    }

    // Données du tableau de bord
    public function stats()
    {
        return response()->json([
            'total' => Bien::count(),
            'valeur_totale' => (float) Bien::sum('valeur'),
            'par_statut' => Bien::selectRaw('statut, count(*) as total')->groupBy('statut')->get(),
            'par_categorie' => Categorie::withCount('biens')->withSum('biens', 'valeur')->get(),
        ]);
    }

    private function validated(Request $request, ?Bien $bien = null): array
    {
        return $request->validate([
            'code_inventaire' => ['required', 'string', 'max:50', Rule::unique('biens', 'code_inventaire')->ignore($bien?->id)],
            'designation' => 'required|string|max:255',
            'categorie_id' => 'required|exists:categories,id',
            'valeur' => 'required|numeric|min:0',
            'date_acquisition' => 'nullable|date',
            'localisation' => 'nullable|string|max:255',
            'etat' => ['required', Rule::in(Bien::ETATS)],
            'statut' => ['required', Rule::in(Bien::STATUTS)],
        ]);
    }
}