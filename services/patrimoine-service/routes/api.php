<?php

use App\Http\Controllers\BienController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\DemandeController;
use App\Http\Middleware\VerifyToken;
use Illuminate\Support\Facades\Route;

// Lecture : tout utilisateur connecté
Route::middleware(VerifyToken::class)->group(function () {
    Route::get('categories', [CategorieController::class, 'index']);
    Route::get('biens/stats', [BienController::class, 'stats']);
    Route::get('biens', [BienController::class, 'index']);
    Route::get('biens/{bien}', [BienController::class, 'show'])->whereNumber('bien');
    Route::get('demandes', [DemandeController::class, 'index']);
});

// Proposer un bien : les agents (et le personnel interne)
Route::middleware(VerifyToken::class . ':agent,gestionnaire')->group(function () {
    Route::post('demandes', [DemandeController::class, 'store']);
});

// Écriture directe : admin et gestionnaire uniquement
Route::middleware(VerifyToken::class . ':admin,gestionnaire')->group(function () {
    Route::post('categories', [CategorieController::class, 'store']);
    Route::put('categories/{categorie}', [CategorieController::class, 'update']);
    Route::delete('categories/{categorie}', [CategorieController::class, 'destroy']);

    Route::post('biens', [BienController::class, 'store']);
    Route::put('biens/{bien}', [BienController::class, 'update'])->whereNumber('bien');
    Route::delete('biens/{bien}', [BienController::class, 'destroy'])->whereNumber('bien');
});

// Validation des demandes : administrateur uniquement
Route::middleware(VerifyToken::class . ':admin')->group(function () {
    Route::get('demandes/compte', [DemandeController::class, 'compte']);
    Route::post('demandes/{demande}/approuver', [DemandeController::class, 'approuver'])->whereNumber('demande');
    Route::post('demandes/{demande}/rejeter', [DemandeController::class, 'rejeter'])->whereNumber('demande');
});