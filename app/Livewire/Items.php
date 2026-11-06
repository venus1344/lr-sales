<?php

namespace App\Livewire;

use App\Livewire\Concerns\AuthorizesAbilities;
use App\Models\Item;
use App\Models\ItemCategory;
use Livewire\Component;
use Livewire\WithPagination;

class Items extends Component
{
    use AuthorizesAbilities, WithPagination;

    public string $search = '';

    public ?int $itemId = null;

    public ?int $category_id = null;

    public string $name = '';

    public ?string $unit_measure = null;

    public ?string $specification = null;

    public $price = '';

    public bool $active = true;

    public bool $vat = true;

    public bool $editing = false;

    public function mount(): void
    {
        $this->authorizeAbility('item_list');
    }

    public function render()
    {
        $items = Item::query()
            ->with('category')
            ->when($this->search !== '', function ($query) {
                $query->where(function ($q) {
                    $q->where('name', 'like', "%{$this->search}%")
                        ->orWhere('specification', 'like', "%{$this->search}%");
                });
            })
            ->orderBy('name')
            ->paginate(15);

        $categories = ItemCategory::whereActive(true)->orderBy('name')->get();

        return view('livewire.items', [
            'items' => $items,
            'categories' => $categories,
        ]);
    }

    public function create(): void
    {
        $this->authorizeAbility('item_store');
        $this->resetForm();
        $this->editing = true;
    }

    public function store(): void
    {
        $this->authorizeAbility('item_store');
        $data = $this->validate();

        Item::create([
            ...$data,
            'created_by' => auth()->id(),
        ]);

        session()->flash('status', 'Item created.');
        $this->resetForm();
    }

    public function edit(int $id): void
    {
        $this->authorizeAbility('item_update');

        $item = Item::findOrFail($id);

        $this->itemId = $item->id;
        $this->category_id = $item->category_id;
        $this->name = $item->name;
        $this->unit_measure = $item->unit_measure;
        $this->specification = $item->specification;
        $this->price = $item->price;
        $this->active = (bool) $item->active;
        $this->vat = (bool) $item->vat;
        $this->editing = true;
    }

    public function update(): void
    {
        $this->authorizeAbility('item_update');
        $data = $this->validate();

        Item::findOrFail($this->itemId)->update([
            ...$data,
            'updated_by' => auth()->id(),
        ]);

        session()->flash('status', 'Item updated.');
        $this->resetForm();
    }

    public function delete(int $id): void
    {
        $this->authorizeAbility('item_remove');

        Item::findOrFail($id)->delete();

        session()->flash('status', 'Item deleted.');
    }

    public function cancel(): void
    {
        $this->resetForm();
    }

    protected function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:item_categories,id'],
            'name' => ['required', 'string', 'max:100'],
            'unit_measure' => ['nullable', 'string', 'max:100'],
            'specification' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'active' => ['boolean'],
            'vat' => ['boolean'],
        ];
    }

    protected function resetForm(): void
    {
        $this->reset([
            'itemId', 'category_id', 'name', 'unit_measure',
            'specification', 'price', 'active', 'vat', 'editing',
        ]);
        $this->active = true;
        $this->vat = true;
        $this->price = '';
    }
}
