<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ItemCategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'description' => fake()->sentence(),
            'active' => true,
        ];
    }
}
