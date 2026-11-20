<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Affectation extends Model
{
    protected $table = 'affectations';

    protected $fillable = ['bien_id', 'service_id', 'utilisateur_id', 'date_debut', 'date_fin', 'motif'];

    protected $casts = [
        'date_debut' => 'date:Y-m-d',
        'date_fin' => 'date:Y-m-d',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}