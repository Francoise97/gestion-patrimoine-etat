<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affectations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('bien_id')->index();
            $table->foreignId('service_id')->constrained('services');
            $table->unsignedBigInteger('utilisateur_id');
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->string('motif')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affectations');
    }
};