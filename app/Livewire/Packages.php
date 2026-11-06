<?php

namespace App\Livewire;

use App\Livewire\Concerns\AuthorizesAbilities;
use App\Models\Package;
use Livewire\Component;
use Livewire\WithPagination;

class Packages extends Component
{
    use AuthorizesAbilities, WithPagination;

    public string $search = '';

    public ?int $packageId = null;

    public string $name = '';

    public string $description = '';

    public $price = '';

    public bool $status = true;

    public bool $editing = false;

    public function mount(): void
    {
        $this->authorizeAbility('package_list');
    }

    public function render()
    {
        $packages = Package::query()
            ->when($this->search !== '', fn ($query) => $query->where('name', 'like', "%{$this->search}%"))
            ->orderBy('name')
            ->paginate(15);

        return view('livewire.packages', ['packages' => $packages]);
    }

    public function create(): void
    {
        $this->authorizeAbility('package_store');
        $this->resetForm();
        $this->editing = true;
    }

    public function store(): void
    {
        $this->authorizeAbility('package_store');
        $data = $this->validate();

        Package::create([
            ...$data,
            'created_by' => auth()->id(),
        ]);

        session()->flash('status', 'Package created.');
        $this->resetForm();
    }

    public function edit(int $id): void
    {
        $this->authorizeAbility('package_update');

        $package = Package::findOrFail($id);

        $this->packageId = $package->id;
        $this->name = $package->name;
        $this->description = $package->description;
        $this->price = $package->price;
        $this->status = (bool) $package->status;
        $this->editing = true;
    }

    public function update(): void
    {
        $this->authorizeAbility('package_update');
        $data = $this->validate();

        Package::findOrFail($this->packageId)->update([
            ...$data,
            'updated_by' => auth()->id(),
        ]);

        session()->flash('status', 'Package updated.');
        $this->resetForm();
    }

    public function delete(int $id): void
    {
        $this->authorizeAbility('package_remove');

        Package::findOrFail($id)->delete();

        session()->flash('status', 'Package deleted.');
    }

    public function cancel(): void
    {
        $this->resetForm();
    }

    protected function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:200'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'status' => ['boolean'],
        ];
    }

    protected function resetForm(): void
    {
        $this->reset(['packageId', 'name', 'description', 'price', 'status', 'editing']);
        $this->status = true;
        $this->price = '';
    }
}
