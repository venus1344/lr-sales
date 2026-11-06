<?php

namespace Tests\Feature;

use App\Models\Ability;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Register a test-only route so we can exercise the ability middleware
        // through a real HTTP request. Each test method boots a fresh app.
        Route::middleware(['auth', 'ability:invoice_store'])
            ->get('/__ability-test', fn () => response('granted'));
    }

    public function test_super_admin_has_any_ability(): void
    {
        $user = User::factory()->create(['super' => true]);

        $this->assertTrue($user->hasAbility('invoice_store'));
        $this->assertTrue($user->hasAbility('nonexistent_ability'));
    }

    public function test_user_has_ability_through_role(): void
    {
        $role = Role::create(['name' => 'Sales']);
        $role->abilities()->attach(Ability::create(['name' => 'invoice_store']));

        $user = User::factory()->create();
        $user->roles()->attach($role);

        $this->assertTrue($user->hasAbility('invoice_store'));
        $this->assertFalse($user->hasAbility('invoice_remove'));
    }

    public function test_user_without_role_has_no_ability(): void
    {
        $this->assertFalse(User::factory()->create()->hasAbility('invoice_store'));
    }

    public function test_ability_middleware_grants_authorized_user(): void
    {
        $role = Role::create(['name' => 'Sales']);
        $role->abilities()->attach(Ability::create(['name' => 'invoice_store']));

        $user = User::factory()->create();
        $user->roles()->attach($role);

        $this->actingAs($user)->get('/__ability-test')->assertOk();
    }

    public function test_ability_middleware_blocks_unauthorized_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/__ability-test')->assertForbidden();
    }

    public function test_ability_middleware_grants_super_admin(): void
    {
        $this->actingAs(User::factory()->create(['super' => true]))
            ->get('/__ability-test')
            ->assertOk();
    }
}
