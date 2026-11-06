<?php

namespace App\Livewire;

use App\Livewire\Concerns\AuthorizesAbilities;
use App\Models\Supplier;
use Livewire\Component;
use Livewire\WithPagination;

class Suppliers extends Component
{
    use AuthorizesAbilities, WithPagination;

    public string $search = '';

    public ?int $supplierId = null;

    public string $name = '';

    public string $location = '';

    public string $contacts = '';

    public ?string $postal_code = null;

    public ?string $postal_address = null;

    public ?string $tin = null;

    public ?string $vrn = null;

    public bool $status = true;

    public bool $editing = false;

    public function mount(): void
    {
        $this->authorizeAbility('supplier_list');
    }

    public function render()
    {
        $suppliers = Supplier::query()
            ->when($this->search !== '', fn ($query) => $query->where('name', 'like', "%{$this->search}%"))
            ->orderBy('name')
            ->paginate(15);

        return view('livewire.suppliers', ['suppliers' => $suppliers]);
    }

    public function create(): void
    {
        $this->authorizeAbility('supplier_store');
        $this->resetForm();
        $this->editing = true;
    }

    public function store(): void
    {
        $this->authorizeAbility('supplier_store');
        $data = $this->validate();

        Supplier::create([
            ...$data,
            'created_by' => auth()->id(),
        ]);

        session()->flash('status', 'Supplier created.');
        $this->resetForm();
    }

    public function edit(int $id): void
    {
        $this->authorizeAbility('supplier_update');

        $supplier = Supplier::findOrFail($id);

        $this->supplierId = $supplier->id;
        $this->name = $supplier->name;
        $this->location = $supplier->location;
        $this->contacts = $supplier->contacts;
        $this->postal_code = $supplier->postal_code;
        $this->postal_address = $supplier->postal_address;
        $this->tin = $supplier->tin;
        $this->vrn = $supplier->vrn;
        $this->status = (bool) $supplier->status;
        $this->editing = true;
    }

    public function update(): void
    {
        $this->authorizeAbility('supplier_update');
        $data = $this->validate();

        Supplier::findOrFail($this->supplierId)->update([
            ...$data,
            'updated_by' => auth()->id(),
        ]);

        session()->flash('status', 'Supplier updated.');
        $this->resetForm();
    }

    public function delete(int $id): void
    {
        $this->authorizeAbility('supplier_remove');

        Supplier::findOrFail($id)->delete();

        session()->flash('status', 'Supplier deleted.');
    }

    public function cancel(): void
    {
        $this->resetForm();
    }

    protected function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:191'],
            'location' => ['required', 'string', 'max:191'],
            'contacts' => ['required', 'string', 'max:191'],
            'postal_code' => ['nullable', 'string', 'max:191'],
            'postal_address' => ['nullable', 'string', 'max:191'],
            'tin' => ['nullable', 'string', 'max:20'],
            'vrn' => ['nullable', 'string', 'max:20'],
            'status' => ['boolean'],
        ];
    }

    protected function resetForm(): void
    {
        $this->reset([
            'supplierId', 'name', 'location', 'contacts', 'postal_code',
            'postal_address', 'tin', 'vrn', 'status', 'editing',
        ]);
        $this->status = true;
    }
}
