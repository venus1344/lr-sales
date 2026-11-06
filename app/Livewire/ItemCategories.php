<?php

namespace App\Livewire;

use App\Livewire\Concerns\AuthorizesAbilities;
use App\Models\ItemCategory;
use Livewire\Component;
use Livewire\WithPagination;

class ItemCategories extends Component
{
    use AuthorizesAbilities, WithPagination;

    public string $search = '';

    public ?int $categoryId = null;

    public string $name = '';

    public ?string $description = null;

    public bool $active = true;

    public bool $editing = false;

    public function mount(): void
    {
        $this->authorizeAbility('item_category_list');
    }

    public function render()
    {
        $categories = ItemCategory::query()
            ->when($this->search !== '', fn ($query) => $query->where('name', 'like', "%{$this->search}%"))
            ->orderBy('name')
            ->paginate(15);

        return view('livewire.item-categories', ['categories' => $categories]);
    }

    public function create(): void
    {
        $this->authorizeAbility('item_category_store');
        $this->resetForm();
        $this->editing = true;
    }

    public function store(): void
    {
        $this->authorizeAbility('item_category_store');
        $data = $this->validate();

        ItemCategory::create([
            ...$data,
            'created_by' => auth()->id(),
        ]);

        session()->flash('status', 'Item category created.');
        $this->resetForm();
    }

    public function edit(int $id): void
    {
        $this->authorizeAbility('item_category_update');

        $category = ItemCategory::findOrFail($id);

        $this->categoryId = $category->id;
        $this->name = $category->name;
        $this->description = $category->description;
        $this->active = (bool) $category->active;
        $this->editing = true;
    }

    public function update(): void
    {
        $this->authorizeAbility('item_category_update');
        $data = $this->validate();

        ItemCategory::findOrFail($this->categoryId)->update([
            ...$data,
            'updated_by' => auth()->id(),
        ]);

        session()->flash('status', 'Item category updated.');
        $this->resetForm();
    }

    public function delete(int $id): void
    {
        $this->authorizeAbility('item_category_remove');

        ItemCategory::findOrFail($id)->delete();

        session()->flash('status', 'Item category deleted.');
    }

    public function cancel(): void
    {
        $this->resetForm();
    }

    protected function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'active' => ['boolean'],
        ];
    }

    protected function resetForm(): void
    {
        $this->reset(['categoryId', 'name', 'description', 'active', 'editing']);
        $this->active = true;
    }
}
