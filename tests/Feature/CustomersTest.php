<?php

namespace Tests\Feature;

use App\Livewire\Customers;
use App\Models\Ability;
use App\Models\Customer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class CustomersTest extends TestCase
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

    public function test_component_requires_customer_list_ability(): void
    {
        Livewire::actingAs(User::factory()->create())
            ->test(Customers::class)
            ->assertForbidden();
    }

    public function test_store_creates_a_customer(): void
    {
        $user = $this->userWithAbility('customer_list', 'customer_store');

        Livewire::actingAs($user)
            ->test(Customers::class)
            ->set('name', 'WeLink Contracting')
            ->set('contact', 'info@welink.co.tz')
            ->set('tin', '100167727')
            ->set('status', true)
            ->call('store')
            ->assertHasNoErrors();

        $this->assertDatabaseHas('customers', ['name' => 'WeLink Contracting', 'tin' => '100167727']);
    }

    public function test_store_requires_customer_store_ability(): void
    {
        $user = $this->userWithAbility('customer_list');

        Livewire::actingAs($user)
            ->test(Customers::class)
            ->set('name', 'WeLink Contracting')
            ->call('store')
            ->assertForbidden();
    }

    public function test_delete_requires_customer_remove_ability(): void
    {
        $user = $this->userWithAbility('customer_list');
        $customer = Customer::factory()->create();

        Livewire::actingAs($user)
            ->test(Customers::class)
            ->call('delete', $customer->id)
            ->assertForbidden();

        $this->assertDatabaseHas('customers', ['id' => $customer->id]);
    }

    public function test_validation_requires_name(): void
    {
        $user = $this->userWithAbility('customer_list', 'customer_store');

        Livewire::actingAs($user)
            ->test(Customers::class)
            ->set('name', '')
            ->call('store')
            ->assertHasErrors(['name']);
    }
}
