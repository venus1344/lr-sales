<?php

namespace Tests\Feature;

use App\Livewire\Packages;
use App\Models\Ability;
use App\Models\Package;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class PackagesTest extends TestCase
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

    public function test_component_requires_package_list_ability(): void
    {
        Livewire::actingAs(User::factory()->create())
            ->test(Packages::class)
            ->assertForbidden();
    }

    public function test_store_creates_a_package(): void
    {
        $user = $this->userWithAbility('package_list', 'package_store');

        Livewire::actingAs($user)
            ->test(Packages::class)
            ->set('name', 'Home 10Mbps')
            ->set('description', 'Residential 10 Mbps package')
            ->set('price', '60000.00')
            ->set('status', true)
            ->call('store')
            ->assertHasNoErrors();

        $this->assertDatabaseHas('packages', ['name' => 'Home 10Mbps']);
    }

    public function test_store_requires_package_store_ability(): void
    {
        $user = $this->userWithAbility('package_list');

        Livewire::actingAs($user)
            ->test(Packages::class)
            ->set('name', 'Home 10Mbps')
            ->set('description', 'Residential 10 Mbps package')
            ->set('price', '60000.00')
            ->call('store')
            ->assertForbidden();
    }

    public function test_delete_requires_package_remove_ability(): void
    {
        $user = $this->userWithAbility('package_list');
        $package = Package::factory()->create();

        Livewire::actingAs($user)
            ->test(Packages::class)
            ->call('delete', $package->id)
            ->assertForbidden();

        $this->assertDatabaseHas('packages', ['id' => $package->id]);
    }

    public function test_validation_requires_name_description_and_price(): void
    {
        $user = $this->userWithAbility('package_list', 'package_store');

        Livewire::actingAs($user)
            ->test(Packages::class)
            ->set('name', '')
            ->set('description', '')
            ->set('price', '')
            ->call('store')
            ->assertHasErrors(['name', 'description', 'price']);
    }
}
