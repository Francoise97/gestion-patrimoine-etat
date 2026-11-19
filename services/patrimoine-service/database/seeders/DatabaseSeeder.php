<?php

namespace Database\Seeders;

use App\Models\Categorie;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Immobilier', 'Véhicule', 'Informatique', 'Mobilier'] as $libelle) {
            Categorie::firstOrCreate(['libelle' => $libelle]);
        }
    }
}