<?php

use App\Http\Controllers\AffectationController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\StatsController;
use App\Http\Middleware\VerifyToken;
use Illuminate\Support\Facades\Route;

// Tout utilisateur connecté
Route::middleware(VerifyToken::class)->group(function () {
    Route::get('affectations/courantes', [AffectationController::class, 'courantes']);
    Route::get('affectations/stats', [StatsController::class, 'index']);
    Route::get('affectations', [AffectationController::class, 'index']);
    Route::get('affectations/services', [ServiceController::class, 'index']);
    Route::get('affectations/maintenances', [MaintenanceController::class, 'index']);
    Route::get('affectations/bien/{bienId}/historique', [AffectationController::class, 'historique'])->whereNumber('bienId');
    Route::post('affectations/maintenances', [MaintenanceController::class, 'store']);
});

// Admin et gestionnaire uniquement
Route::middleware(VerifyToken::class . ':admin,gestionnaire')->group(function () {
    Route::post('affectations', [AffectationController::class, 'store']);
    Route::post('affectations/services', [ServiceController::class, 'store']);
    Route::post('affectations/bien/{bienId}/sortie', [AffectationController::class, 'sortie'])->whereNumber('bienId');
    Route::put('affectations/maintenances/{maintenance}', [MaintenanceController::class, 'update'])->whereNumber('maintenance');
});