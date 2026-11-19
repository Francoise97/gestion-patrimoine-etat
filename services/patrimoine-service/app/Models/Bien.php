<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bien extends Model
{
    protected $table = 'biens';

    public const ETATS = ['neuf', 'bon', 'use', 'hors_service'];
    public const STATUTS = ['en_service', 'reforme', 'cede'];

    protected $fillable = [
        'code_inventaire', 'designation', 'categorie_id', 'valeur',
        'date_acquisition', 'localisation', 'etat', 'statut',
    ];

    protected $casts = [
        'valeur' => 'decimal:2',
        'date_acquisition' => 'date:Y-m-d',
    ];

    public function categorie()
    {
        return $this->belongsTo(Categorie::class);
    }
}