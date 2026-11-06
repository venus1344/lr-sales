<?php

namespace Database\Factories;

use App\Models\ItemCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class ItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'category_id' => ItemCategory::factory(),
            'name' => fake()->unique()->words(3, true),
            'unit_measure' => 'pcs',
            'specification' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 1, 1000000),
            'active' => true,
            'vat' => true,
        ];
    }
}
