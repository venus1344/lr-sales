<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SupplierFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'location' => fake()->city(),
            'contacts' => fake()->phoneNumber(),
            'postal_code' => fake()->optional()->postcode(),
            'postal_address' => fake()->optional()->address(),
            'tin' => fake()->numerify('#########'),
            'vrn' => null,
            'status' => true,
        ];
    }
}
