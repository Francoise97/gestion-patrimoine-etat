<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;

class CategorieController extends Controller
{
    public function index()
    {
        return response()->json(Categorie::withCount('biens')->orderBy('libelle')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'libelle' => 'required|string|max:100|unique:categories,libelle',
            'description' => 'nullable|string',
        ]);

        return response()->json(Categorie::create($data), 201);
    }

    public function update(Request $request, Categorie $categorie)
    {
        $data = $request->validate([
            'libelle' => 'required|string|max:100|unique:categories,libelle,' . $categorie->id,
            'description' => 'nullable|string',
        ]);

        $categorie->update($data);

        return response()->json($categorie);
    }

    public function destroy(Categorie $categorie)
    {
        if ($categorie->biens()->exists()) {
            return response()->json(['message' => 'Impossible : des biens utilisent cette catégorie'], 422);
        }

        $categorie->delete();

        return response()->json(null, 204);
    }
}