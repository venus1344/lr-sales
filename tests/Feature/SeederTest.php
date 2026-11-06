<?php

namespace Tests\Feature;

use App\Models\Ability;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\AbilitySeeder;
use Database\Seeders\AdminRoleSeeder;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use RuntimeException;
use Tests\TestCase;

class SeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_ability_seeder_creates_75_unique_abilities(): void
    {
        $this->seed(AbilitySeeder::class);

        $this->assertSame(75, Ability::count());
        $this->assertDatabaseHas('abilities', ['name' => 'invoice_store']);
        $this->assertDatabaseHas('abilities', ['name' => 'item_category_list']);
    }

    public function test_ability_seeder_is_idempotent(): void
    {
        $this->seed(AbilitySeeder::class);
        $this->seed(AbilitySeeder::class);

        $this->assertSame(75, Ability::count());
    }

    public function test_admin_role_seeder_grants_every_ability(): void
    {
        $this->seed([AbilitySeeder::class, AdminRoleSeeder::class]);

        $role = Role::where('name', 'Admin')->first();

        $this->assertNotNull($role);
        $this->assertSame(75, $role->abilities()->count());
    }

    public function test_admin_user_seeder_aborts_without_credentials(): void
    {
        $this->seed([AbilitySeeder::class, AdminRoleSeeder::class]);

        $this->expectException(RuntimeException::class);

        $this->seed(AdminUserSeeder::class);
    }

    public function test_admin_user_seeder_creates_super_admin(): void
    {
        $this->seed([AbilitySeeder::class, AdminRoleSeeder::class]);

        $this->setAdminEnv();

        try {
            $this->seed(AdminUserSeeder::class);
        } finally {
            $this->clearAdminEnv();
        }

        $admin = User::where('email', 'admin@example.com')->first();

        $this->assertNotNull($admin);
        $this->assertTrue($admin->super);
        $this->assertTrue($admin->active);
        $this->assertNotNull($admin->email_verified_at);
        $this->assertTrue(Hash::check('secret-password', $admin->password));
        $this->assertTrue($admin->hasAbility('invoice_store'));
    }

    private function setAdminEnv(): void
    {
        foreach ([
            'ADMIN_NAME' => 'Test Admin',
            'ADMIN_EMAIL' => 'admin@example.com',
            'ADMIN_PASSWORD' => 'secret-password',
        ] as $key => $value) {
            putenv("$key=$value");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }

    private function clearAdminEnv(): void
    {
        foreach (['ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'] as $key) {
            putenv($key);
            unset($_ENV[$key], $_SERVER[$key]);
        }
    }
}
