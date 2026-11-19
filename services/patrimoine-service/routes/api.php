<?php

use App\Http\Controllers\BienController;
use App\Http\Controllers\CategorieController;
use App\Http\Middleware\VerifyToken;
use Illuminate\Support\Facades\Route;

// Lecture : tout utilisateur connecté
Route::middleware(VerifyToken::class)->group(function () {
    Route::get('categories', [CategorieController::class, 'index']);
    Route::get('biens/stats', [BienController::class, 'stats']);
    Route::get('biens', [BienController::class, 'index']);
    Route::get('biens/{bien}', [BienController::class, 'show'])->whereNumber('bien');
});

// Écriture : admin et gestionnaire uniquement
Route::middleware(VerifyToken::class . ':admin,gestionnaire')->group(function () {
    Route::post('categories', [CategorieController::class, 'store']);
    Route::put('categories/{categorie}', [CategorieController::class, 'update']);
    Route::delete('categories/{categorie}', [CategorieController::class, 'destroy']);

    Route::post('biens', [BienController::class, 'store']);
    Route::put('biens/{bien}', [BienController::class, 'update'])->whereNumber('bien');
    Route::delete('biens/{bien}', [BienController::class, 'destroy'])->whereNumber('bien');
});