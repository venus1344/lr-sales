<?php

namespace App\Livewire;

use App\Livewire\Concerns\AuthorizesAbilities;
use App\Models\Customer;
use Livewire\Component;
use Livewire\WithPagination;

class Customers extends Component
{
    use AuthorizesAbilities, WithPagination;

    public string $search = '';

    public ?int $customerId = null;

    public string $name = '';

    public ?string $postal_code = null;

    public ?string $postal_address = null;

    public ?string $location = null;

    public ?string $contact = null;

    public ?string $tin = null;

    public ?string $vrn = null;

    public bool $status = true;

    public bool $editing = false;

    public function mount(): void
    {
        $this->authorizeAbility('customer_list');
    }

    public function render()
    {
        $customers = Customer::query()
            ->when($this->search !== '', fn ($query) => $query->where('name', 'like', "%{$this->search}%"))
            ->orderBy('name')
            ->paginate(15);

        return view('livewire.customers', ['customers' => $customers]);
    }

    public function create(): void
    {
        $this->authorizeAbility('customer_store');
        $this->resetForm();
        $this->editing = true;
    }

    public function store(): void
    {
        $this->authorizeAbility('customer_store');
        $data = $this->validate();

        Customer::create([
            ...$data,
            'created_by' => auth()->id(),
        ]);

        session()->flash('status', 'Customer created.');
        $this->resetForm();
    }

    public function edit(int $id): void
    {
        $this->authorizeAbility('customer_update');

        $customer = Customer::findOrFail($id);

        $this->customerId = $customer->id;
        $this->name = $customer->name;
        $this->postal_code = $customer->postal_code;
        $this->postal_address = $customer->postal_address;
        $this->location = $customer->location;
        $this->contact = $customer->contact;
        $this->tin = $customer->tin;
        $this->vrn = $customer->vrn;
        $this->status = (bool) $customer->status;
        $this->editing = true;
    }

    public function update(): void
    {
        $this->authorizeAbility('customer_update');
        $data = $this->validate();

        Customer::findOrFail($this->customerId)->update([
            ...$data,
            'updated_by' => auth()->id(),
        ]);

        session()->flash('status', 'Customer updated.');
        $this->resetForm();
    }

    public function delete(int $id): void
    {
        $this->authorizeAbility('customer_remove');

        Customer::findOrFail($id)->delete();

        session()->flash('status', 'Customer deleted.');
    }

    public function cancel(): void
    {
        $this->resetForm();
    }

    protected function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:191'],
            'postal_code' => ['nullable', 'string', 'max:191'],
            'postal_address' => ['nullable', 'string', 'max:191'],
            'location' => ['nullable', 'string', 'max:191'],
            'contact' => ['nullable', 'string', 'max:191'],
            'tin' => ['nullable', 'string', 'max:20'],
            'vrn' => ['nullable', 'string', 'max:20'],
            'status' => ['boolean'],
        ];
    }

    protected function resetForm(): void
    {
        $this->reset([
            'customerId', 'name', 'postal_code', 'postal_address',
            'location', 'contact', 'tin', 'vrn', 'status', 'editing',
        ]);
        $this->status = true;
    }
}
