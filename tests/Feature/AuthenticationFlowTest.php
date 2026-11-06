<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AbilitySeeder;
use Database\Seeders\AdminRoleSeeder;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_log_in_and_reach_dashboard(): void
    {
        $this->seed([AbilitySeeder::class, AdminRoleSeeder::class]);
        $this->setAdminEnv();

        try {
            $this->seed(AdminUserSeeder::class);
        } finally {
            $this->clearAdminEnv();
        }

        $response = $this->post('/login', [
            'email' => 'admin@example.com',
            'password' => 'secret-password',
        ]);

        $response->assertRedirect('/home');
        $this->assertAuthenticated();

        $this->get('/home')->assertOk();
    }

    public function test_unverified_user_is_redirected_to_verification(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $this->actingAs($user)
            ->get('/home')
            ->assertRedirect(route('verification.notice'));
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
