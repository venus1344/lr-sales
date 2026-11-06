<?php

namespace Tests\Feature;

use App\Livewire\Suppliers;
use App\Models\Ability;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class SuppliersTest extends TestCase
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

    public function test_component_requires_supplier_list_ability(): void
    {
        Livewire::actingAs(User::factory()->create())
            ->test(Suppliers::class)
            ->assertForbidden();
    }

    public function test_store_creates_a_supplier(): void
    {
        $user = $this->userWithAbility('supplier_list', 'supplier_store');

        Livewire::actingAs($user)
            ->test(Suppliers::class)
            ->set('name', 'Acme Supplies')
            ->set('location', 'Arusha')
            ->set('contacts', 'info@acme.co.tz')
            ->set('tin', '100167727')
            ->set('vrn', '11006745W')
            ->set('status', true)
            ->call('store')
            ->assertHasNoErrors();

        $this->assertDatabaseHas('suppliers', ['name' => 'Acme Supplies', 'tin' => '100167727']);
    }

    public function test_store_requires_supplier_store_ability(): void
    {
        $user = $this->userWithAbility('supplier_list');

        Livewire::actingAs($user)
            ->test(Suppliers::class)
            ->set('name', 'Acme Supplies')
            ->set('location', 'Arusha')
            ->set('contacts', 'info@acme.co.tz')
            ->call('store')
            ->assertForbidden();
    }

    public function test_delete_requires_supplier_remove_ability(): void
    {
        $user = $this->userWithAbility('supplier_list');
        $supplier = Supplier::factory()->create();

        Livewire::actingAs($user)
            ->test(Suppliers::class)
            ->call('delete', $supplier->id)
            ->assertForbidden();

        $this->assertDatabaseHas('suppliers', ['id' => $supplier->id]);
    }

    public function test_validation_requires_required_fields(): void
    {
        $user = $this->userWithAbility('supplier_list', 'supplier_store');

        Livewire::actingAs($user)
            ->test(Suppliers::class)
            ->set('name', '')
            ->set('location', '')
            ->set('contacts', '')
            ->call('store')
            ->assertHasErrors(['name', 'location', 'contacts']);
    }
}
