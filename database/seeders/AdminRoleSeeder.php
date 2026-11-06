<?php

namespace Database\Seeders;

use App\Models\Ability;
use App\Models\Role;
use Illuminate\Database\Seeder;

class AdminRoleSeeder extends Seeder
{
    /**
     * Create the "Admin" role and grant it every ability.
     */
    public function run(): void
    {
        $this->call(AbilitySeeder::class);

        $role = Role::firstOrCreate(
            ['name' => 'Admin'],
            [
                'description' => 'Office administration',
                'label' => 'Admin',
            ]
        );

        $role->abilities()->syncWithoutDetaching(Ability::pluck('id')->all());
    }
}
