<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Maintenance extends Model
{
    public const STATUTS = ['signale', 'en_cours', 'resolu'];

    protected $table = 'maintenances';

    protected $fillable = ['bien_id', 'utilisateur_id', 'description', 'date_signalement', 'statut'];

    protected $casts = ['date_signalement' => 'date:Y-m-d'];
}