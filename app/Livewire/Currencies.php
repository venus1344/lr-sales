<?php

namespace App\Livewire;

use App\Livewire\Concerns\AuthorizesAbilities;
use App\Models\Currency;
use Livewire\Component;
use Livewire\WithPagination;

class Currencies extends Component
{
    use AuthorizesAbilities, WithPagination;

    public string $search = '';

    public ?int $currencyId = null;

    public string $code = '';

    public string $name = '';

    public $rate = '1.00';

    public bool $active = true;

    public bool $editing = false;

    public function mount(): void
    {
        $this->authorizeAbility('currency_list');
    }

    public function render()
    {
        $currencies = Currency::query()
            ->when($this->search !== '', function ($query) {
                $query->where(function ($q) {
                    $q->where('name', 'like', "%{$this->search}%")
                        ->orWhere('code', 'like', "%{$this->search}%");
                });
            })
            ->orderBy('name')
            ->paginate(15);

        return view('livewire.currencies', ['currencies' => $currencies]);
    }

    public function create(): void
    {
        $this->authorizeAbility('currency_store');
        $this->resetForm();
        $this->editing = true;
    }

    public function store(): void
    {
        $this->authorizeAbility('currency_store');
        $data = $this->validate();

        Currency::create([
            ...$data,
            'created_by' => auth()->id(),
        ]);

        session()->flash('status', 'Currency created.');
        $this->resetForm();
    }

    public function edit(int $id): void
    {
        $this->authorizeAbility('currency_update');

        $currency = Currency::findOrFail($id);

        $this->currencyId = $currency->id;
        $this->code = $currency->code;
        $this->name = $currency->name;
        $this->rate = $currency->rate;
        $this->active = (bool) $currency->active;
        $this->editing = true;
    }

    public function update(): void
    {
        $this->authorizeAbility('currency_update');
        $data = $this->validate();

        Currency::findOrFail($this->currencyId)->update([
            ...$data,
            'updated_by' => auth()->id(),
        ]);

        session()->flash('status', 'Currency updated.');
        $this->resetForm();
    }

    public function delete(int $id): void
    {
        $this->authorizeAbility('currency_remove');

        Currency::findOrFail($id)->delete();

        session()->flash('status', 'Currency deleted.');
    }

    public function cancel(): void
    {
        $this->resetForm();
    }

    protected function rules(): array
    {
        return [
            'code' => ['required', 'string', 'size:3', 'alpha'],
            'name' => ['required', 'string', 'max:60'],
            'rate' => ['required', 'numeric', 'min:0'],
            'active' => ['boolean'],
        ];
    }

    protected function resetForm(): void
    {
        $this->reset(['currencyId', 'code', 'name', 'rate', 'active', 'editing']);
        $this->active = true;
        $this->rate = '1.00';
    }
}
