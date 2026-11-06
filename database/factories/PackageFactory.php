<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PackageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 1, 1000000),
            'status' => true,
        ];
    }
}
