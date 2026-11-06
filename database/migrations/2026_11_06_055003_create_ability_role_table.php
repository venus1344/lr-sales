<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ability_role', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by')->nullable()->index();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ability_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->primary(['role_id', 'ability_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ability_role');
    }
};
