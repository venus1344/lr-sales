<?php

namespace Tests\Feature;

use App\Livewire\Items;
use App\Models\Ability;
use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class ItemsTest extends TestCase
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

    public function test_component_requires_item_list_ability(): void
    {
        Livewire::actingAs(User::factory()->create())
            ->test(Items::class)
            ->assertForbidden();
    }

    public function test_store_creates_an_item(): void
    {
        $user = $this->userWithAbility('item_list', 'item_store');
        $category = ItemCategory::factory()->create();

        Livewire::actingAs($user)
            ->test(Items::class)
            ->set('category_id', $category->id)
            ->set('name', 'Router')
            ->set('unit_measure', 'pcs')
            ->set('price', '150000.00')
            ->set('vat', true)
            ->call('store')
            ->assertHasNoErrors();

        $this->assertDatabaseHas('items', ['name' => 'Router', 'category_id' => $category->id]);
    }

    public function test_store_requires_item_store_ability(): void
    {
        $user = $this->userWithAbility('item_list');
        $category = ItemCategory::factory()->create();

        Livewire::actingAs($user)
            ->test(Items::class)
            ->set('category_id', $category->id)
            ->set('name', 'Router')
            ->set('price', '150000.00')
            ->call('store')
            ->assertForbidden();
    }

    public function test_delete_requires_item_remove_ability(): void
    {
        $user = $this->userWithAbility('item_list');
        $item = Item::factory()->create();

        Livewire::actingAs($user)
            ->test(Items::class)
            ->call('delete', $item->id)
            ->assertForbidden();

        $this->assertDatabaseHas('items', ['id' => $item->id]);
    }

    public function test_validation_requires_category_name_and_price(): void
    {
        $user = $this->userWithAbility('item_list', 'item_store');

        Livewire::actingAs($user)
            ->test(Items::class)
            ->set('category_id', null)
            ->set('name', '')
            ->set('price', '')
            ->call('store')
            ->assertHasErrors(['category_id', 'name', 'price']);
    }
}
