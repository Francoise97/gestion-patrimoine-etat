<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Demande extends Model
{
    protected $table = 'demandes';

    protected $fillable = [
        'code_inventaire', 'designation', 'categorie_id', 'valeur', 'date_acquisition',
        'localisation', 'etat', 'demandeur_id', 'demandeur_nom', 'statut',
        'motif_rejet', 'bien_id', 'traite_le',
    ];

    protected $casts = [
        'valeur' => 'decimal:2',
        'date_acquisition' => 'date:Y-m-d',
        'traite_le' => 'datetime',
    ];

    public function categorie()
    {
        return $this->belongsTo(Categorie::class);
    }
}