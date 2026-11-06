<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'postal_code' => fake()->optional()->postcode(),
            'postal_address' => fake()->optional()->address(),
            'location' => fake()->optional()->city(),
            'contact' => fake()->phoneNumber(),
            'tin' => fake()->numerify('#########'),
            'vrn' => null,
            'status' => true,
        ];
    }
}
