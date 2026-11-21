<?php

namespace App\Http\Controllers;

use App\Models\Affectation;
use App\Models\Maintenance;

class StatsController extends Controller
{
    public function index()
    {
        $debut = now()->startOfMonth()->subMonths(5);

        $parMois = Maintenance::where('date_signalement', '>=', $debut->toDateString())
            ->get()
            ->groupBy(fn ($m) => $m->date_signalement->format('Y-m'))
            ->map->count();

        $mois = [];
        for ($i = 5; $i >= 0; $i--) {
            $cle = now()->startOfMonth()->subMonths($i)->format('Y-m');
            $mois[] = ['mois' => $cle, 'total' => $parMois[$cle] ?? 0];
        }

        return response()->json([
            'maintenances_ouvertes' => Maintenance::whereIn('statut', ['signale', 'en_cours'])->count(),
            'pannes_par_mois' => $mois,
            'derniers_mouvements' => Affectation::with('service')->orderByDesc('id')->limit(5)->get(),
        ]);
    }
}