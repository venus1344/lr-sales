<?php

namespace Tests\Feature;

use App\Livewire\Currencies;
use App\Models\Ability;
use App\Models\Currency;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class CurrenciesTest extends TestCase
{
    use RefreshDatabase;

    private function userWithAbility(string ...$abilities): User
    {
        $role = Role::create(['name' => 'Test']);
        foreach ($abilities as $name) {
            $role->abilities()->attach(Ability::firstOrCreate(['name' => $name]));
        }

        $user = User::factory()->create();
        $user->roles()->attach($role);

        return $user;
    }

    public function test_component_requires_currency_list_ability(): void
    {
        Livewire::actingAs(User::factory()->create())
            ->test(Currencies::class)
            ->assertForbidden();
    }

    public function test_super_admin_can_view_currencies(): void
    {
        Livewire::actingAs(User::factory()->create(['super' => true]))
            ->test(Currencies::class)
            ->assertOk()
            ->assertSee('New currency');
    }

    public function test_store_creates_a_currency(): void
    {
        $user = $this->userWithAbility('currency_list', 'currency_store');

        Livewire::actingAs($user)
            ->test(Currencies::class)
            ->set('code', 'USD')
            ->set('name', 'US Dollar')
            ->set('rate', '2500.50')
            ->set('active', true)
            ->call('store')
            ->assertHasNoErrors();

        $this->assertDatabaseHas('currencies', ['code' => 'USD', 'name' => 'US Dollar']);
    }

    public function test_store_requires_currency_store_ability(): void
    {
        $user = $this->userWithAbility('currency_list');

        Livewire::actingAs($user)
            ->test(Currencies::class)
            ->set('code', 'USD')
            ->set('name', 'US Dollar')
            ->set('rate', '2500.50')
            ->call('store')
            ->assertForbidden();
    }

    public function test_delete_requires_currency_remove_ability(): void
    {
        $user = $this->userWithAbility('currency_list');
        $currency = Currency::factory()->create();

        Livewire::actingAs($user)
            ->test(Currencies::class)
            ->call('delete', $currency->id)
            ->assertForbidden();

        $this->assertDatabaseHas('currencies', ['id' => $currency->id]);
    }

    public function test_validation_rejects_invalid_currency(): void
    {
        $user = $this->userWithAbility('currency_list', 'currency_store');

        Livewire::actingAs($user)
            ->test(Currencies::class)
            ->set('code', 'US')
            ->set('name', '')
            ->set('rate', 'abc')
            ->call('store')
            ->assertHasErrors(['code', 'name', 'rate']);
    }
}
