<?php

namespace Tests\Feature;

use App\Models\Currency;
use App\Models\Customer;
use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\Package;
use App\Models\Supplier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_item_belongs_to_category(): void
    {
        $item = Item::factory()->create();

        $this->assertInstanceOf(ItemCategory::class, $item->category);
        $this->assertDatabaseHas('items', ['id' => $item->id]);
    }

    public function test_item_category_has_many_items(): void
    {
        $category = ItemCategory::factory()->create();
        $items = Item::factory()->count(3)->create(['category_id' => $category->id]);

        $this->assertCount(3, $category->items);
        $this->assertSame($category->id, $items->first()->category_id);
    }

    public function test_master_data_models_can_be_created(): void
    {
        $category = ItemCategory::factory()->create();
        $currency = Currency::factory()->create();
        $customer = Customer::factory()->create();
        $supplier = Supplier::factory()->create();
        $package = Package::factory()->create();

        $this->assertDatabaseHas('item_categories', ['id' => $category->id]);
        $this->assertDatabaseHas('currencies', ['id' => $currency->id]);
        $this->assertDatabaseHas('customers', ['id' => $customer->id]);
        $this->assertDatabaseHas('suppliers', ['id' => $supplier->id]);
        $this->assertDatabaseHas('packages', ['id' => $package->id]);
    }
}
