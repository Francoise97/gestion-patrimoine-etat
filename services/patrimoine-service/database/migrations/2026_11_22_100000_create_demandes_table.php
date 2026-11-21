<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demandes', function (Blueprint $table) {
            $table->id();
            $table->string('code_inventaire');
            $table->string('designation');
            $table->foreignId('categorie_id')->constrained('categories');
            $table->decimal('valeur', 15, 2)->default(0);
            $table->date('date_acquisition')->nullable();
            $table->string('localisation')->nullable();
            $table->string('etat')->default('bon');
            $table->unsignedBigInteger('demandeur_id')->index();
            $table->string('demandeur_nom');
            $table->string('statut')->default('en_attente');
            $table->text('motif_rejet')->nullable();
            $table->unsignedBigInteger('bien_id')->nullable();
            $table->timestamp('traite_le')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes');
    }
};