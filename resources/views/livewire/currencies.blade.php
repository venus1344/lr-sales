<div>
    <div class="row mb-3">
        <div class="col-md-6">
            <input type="search" wire:model.live="search" class="form-control" placeholder="Search currencies...">
        </div>
        <div class="col-md-6 text-end">
            <button wire:click="create" class="btn btn-primary">
                <i class="fa-solid fa-plus me-1"></i>New currency
            </button>
        </div>
    </div>

    @if (session('status'))
        <div class="alert alert-success alert-dismissible" role="alert">
            {{ session('status') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    @if ($editing)
        <div class="card mb-3">
            <div class="card-header">{{ $currencyId ? 'Edit currency' : 'New currency' }}</div>
            <div class="card-body">
                <form wire:submit.prevent="{{ $currencyId ? 'update' : 'store' }}">
                    <div class="row">
                        <div class="col-md-3 mb-3">
                            <label class="form-label" for="code">Code</label>
                            <input type="text" wire:model="code" id="code"
                                   class="form-control @error('code') is-invalid @enderror" placeholder="TZS">
                            @error('code')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label" for="name">Name</label>
                            <input type="text" wire:model="name" id="name"
                                   class="form-control @error('name') is-invalid @enderror" placeholder="Tanzanian Shilling">
                            @error('name')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-3 mb-3">
                            <label class="form-label" for="rate">Rate</label>
                            <input type="number" step="0.01" wire:model="rate" id="rate"
                                   class="form-control @error('rate') is-invalid @enderror" placeholder="1.00">
                            @error('rate')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-2 mb-3 d-flex align-items-end">
                            <div class="form-check">
                                <input type="checkbox" wire:model="active" class="form-check-input" id="active">
                                <label class="form-check-label" for="active">Active</label>
                            </div>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-success">
                        <i class="fa-solid fa-save me-1"></i>Save
                    </button>
                    <button type="button" wire:click="cancel" class="btn btn-secondary">Cancel</button>
                </form>
            </div>
        </div>
    @endif

    <div class="card">
        <div class="card-body p-0">
            <table class="table table-striped align-middle mb-0">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Rate</th>
                        <th>Status</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($currencies as $currency)
                        <tr>
                            <td>{{ $currency->code }}</td>
                            <td>{{ $currency->name }}</td>
                            <td>{{ $currency->rate }}</td>
                            <td>
                                <span class="badge {{ $currency->active ? 'text-bg-success' : 'text-bg-secondary' }}">
                                    {{ $currency->active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="text-end">
                                <button wire:click="edit({{ $currency->id }})" class="btn btn-sm btn-outline-primary">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button wire:click="delete({{ $currency->id }})"
                                        wire:confirm="Delete this currency?"
                                        class="btn btn-sm btn-outline-danger">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="text-center text-muted py-3">No currencies found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if ($currencies->hasPages())
            <div class="card-footer">{{ $currencies->links() }}</div>
        @endif
    </div>
</div>
