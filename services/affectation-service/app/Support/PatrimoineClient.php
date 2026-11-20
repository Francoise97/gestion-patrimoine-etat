<?php

namespace App\Support;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;

class PatrimoineClient
{
    private function base(): string
    {
        return rtrim(env('PATRIMOINE_SERVICE_URL', 'http://127.0.0.1:8002'), '/') . '/api';
    }

    public function bien(int $id, string $token): ?array
    {
        try {
            $r = Http::withToken($token)->acceptJson()->timeout(5)->get($this->base() . "/biens/$id");
        } catch (\Throwable $e) {
            abort(503, 'Service patrimoine indisponible');
        }

        return $r->successful() ? $r->json() : null;
    }

    public function changerStatut(array $bien, string $statut, string $token): bool
    {
        $payload = Arr::only($bien, [
            'code_inventaire', 'designation', 'categorie_id', 'valeur',
            'date_acquisition', 'localisation', 'etat',
        ]) + ['statut' => $statut];

        try {
            $r = Http::withToken($token)->acceptJson()->timeout(5)->put($this->base() . '/biens/' . $bien['id'], $payload);
        } catch (\Throwable $e) {
            abort(503, 'Service patrimoine indisponible');
        }

        return $r->successful();
    }
}