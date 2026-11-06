<?php

namespace Tests\Feature;

use App\Livewire\ItemCategories;
use App\Models\Ability;
use App\Models\ItemCategory;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class ItemCategoriesTest extends TestCase
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

    public function test_component_requires_item_category_list_ability(): void
    {
        Livewire::actingAs(User::factory()->create())
            ->test(ItemCategories::class)
            ->assertForbidden();
    }

    public function test_store_creates_a_category(): void
    {
        $user = $this->userWithAbility('item_category_list', 'item_category_store');

        Livewire::actingAs($user)
            ->test(ItemCategories::class)
            ->set('name', 'Networking')
            ->set('description', 'Network hardware')
            ->set('active', true)
            ->call('store')
            ->assertHasNoErrors();

        $this->assertDatabaseHas('item_categories', ['name' => 'Networking']);
    }

    public function test_store_requires_item_category_store_ability(): void
    {
        $user = $this->userWithAbility('item_category_list');

        Livewire::actingAs($user)
            ->test(ItemCategories::class)
            ->set('name', 'Networking')
            ->call('store')
            ->assertForbidden();
    }

    public function test_delete_requires_item_category_remove_ability(): void
    {
        $user = $this->userWithAbility('item_category_list');
        $category = ItemCategory::factory()->create();

        Livewire::actingAs($user)
            ->test(ItemCategories::class)
            ->call('delete', $category->id)
            ->assertForbidden();

        $this->assertDatabaseHas('item_categories', ['id' => $category->id]);
    }

    public function test_validation_rejects_missing_name(): void
    {
        $user = $this->userWithAbility('item_category_list', 'item_category_store');

        Livewire::actingAs($user)
            ->test(ItemCategories::class)
            ->set('name', '')
            ->call('store')
            ->assertHasErrors(['name']);
    }
}
