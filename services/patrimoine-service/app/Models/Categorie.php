<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categorie extends Model
{
    protected $table = 'categories';

    protected $fillable = ['libelle', 'description'];

    public function biens()
    {
        return $this->hasMany(Bien::class);
    }
}