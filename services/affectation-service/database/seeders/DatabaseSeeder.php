<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['code' => 'MEF', 'nom' => 'Ministère des Finances', 'ministere' => 'Finances'],
            ['code' => 'MSA', 'nom' => 'Ministère de la Santé', 'ministere' => 'Santé'],
            ['code' => 'MEN', 'nom' => 'Ministère de l\'Éducation', 'ministere' => 'Éducation'],
        ];

        foreach ($services as $s) {
            Service::firstOrCreate(['code' => $s['code']], $s);
        }
    }
}