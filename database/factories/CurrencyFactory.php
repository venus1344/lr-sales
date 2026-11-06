<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CurrencyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => fake()->currencyCode(),
            'name' => fake()->word(),
            'rate' => fake()->randomFloat(2, 0.5, 3000),
            'active' => true,
        ];
    }
}
