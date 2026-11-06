<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class AdminUserSeeder extends Seeder
{
    /**
     * Create the super-admin account.
     *
     * Guarded: credentials are read from the environment only. If any of
     * ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD is missing, seeding aborts.
     * This deliberately prevents the hardcoded-credential defect that let the
     * old `laraforma` app be compromised (see docs/SPECIFICATION.md §2).
     */
    public function run(): void
    {
        $name = env('ADMIN_NAME');
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if (blank($name) || blank($email) || blank($password)) {
            throw new RuntimeException(
                'The admin seeder requires ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD to be set in the environment.'
            );
        }

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'super' => true,
                'active' => true,
                'email_verified_at' => now(),
            ]
        );

        $adminRole = Role::where('name', 'Admin')->firstOrFail();

        if (! $user->roles()->where('role_id', $adminRole->id)->exists()) {
            $user->roles()->attach($adminRole->id, ['created_by' => $user->id]);
        }
    }
}
