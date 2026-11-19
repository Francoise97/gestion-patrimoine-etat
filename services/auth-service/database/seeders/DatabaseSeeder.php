<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Compte administrateur de démonstration (à changer en production)
        User::firstOrCreate(
            ['email' => 'admin@patrimoine.gov'],
            ['name' => 'Administrateur', 'password' => 'Admin@1234', 'role' => 'admin']
        );
    }
}