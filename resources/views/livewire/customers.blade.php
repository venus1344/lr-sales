<div>
    <div class="row mb-3">
        <div class="col-md-6">
            <input type="search" wire:model.live="search" class="form-control" placeholder="Search customers...">
        </div>
        <div class="col-md-6 text-end">
            <button wire:click="create" class="btn btn-primary">
                <i class="fa-solid fa-plus me-1"></i>New customer
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
            <div class="card-header">{{ $customerId ? 'Edit customer' : 'New customer' }}</div>
            <div class="card-body">
                <form wire:submit.prevent="{{ $customerId ? 'update' : 'store' }}">
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label class="form-label" for="name">Name</label>
                            <input type="text" wire:model="name" id="name"
                                   class="form-control @error('name') is-invalid @enderror">
                            @error('name')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label" for="contact">Contact</label>
                            <input type="text" wire:model="contact" id="contact"
                                   class="form-control @error('contact') is-invalid @enderror">
                            @error('contact')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label" for="location">Location</label>
                            <input type="text" wire:model="location" id="location"
                                   class="form-control @error('location') is-invalid @enderror">
                            @error('location')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-3 mb-3">
                            <label class="form-label" for="postal_code">Postal code</label>
                            <input type="text" wire:model="postal_code" id="postal_code"
                                   class="form-control @error('postal_code') is-invalid @enderror">
                            @error('postal_code')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label" for="postal_address">Postal address</label>
                            <input type="text" wire:model="postal_address" id="postal_address"
                                   class="form-control @error('postal_address') is-invalid @enderror">
                            @error('postal_address')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-3 mb-3">
                            <label class="form-label" for="tin">TIN</label>
                            <input type="text" wire:model="tin" id="tin" maxlength="20"
                                   class="form-control @error('tin') is-invalid @enderror" placeholder="9 digits">
                            @error('tin')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-2 mb-3">
                            <label class="form-label" for="vrn">VRN</label>
                            <input type="text" wire:model="vrn" id="vrn" maxlength="20"
                                   class="form-control @error('vrn') is-invalid @enderror" placeholder="9 chars">
                            @error('vrn')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>
                    <div class="form-check mb-3">
                        <input type="checkbox" wire:model="status" class="form-check-input" id="status">
                        <label class="form-check-label" for="status">Active</label>
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
                        <th>Name</th>
                        <th>Location</th>
                        <th>Contact</th>
                        <th>TIN</th>
                        <th>Status</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($customers as $customer)
                        <tr>
                            <td>{{ $customer->name }}</td>
                            <td>{{ $customer->location }}</td>
                            <td>{{ $customer->contact }}</td>
                            <td>{{ \App\Support\Formatting::tin($customer->tin) }}</td>
                            <td>
                                <span class="badge {{ $customer->status ? 'text-bg-success' : 'text-bg-secondary' }}">
                                    {{ $customer->status ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="text-end">
                                <button wire:click="edit({{ $customer->id }})" class="btn btn-sm btn-outline-primary">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button wire:click="delete({{ $customer->id }})"
                                        wire:confirm="Delete this customer?"
                                        class="btn btn-sm btn-outline-danger">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="text-center text-muted py-3">No customers found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if ($customers->hasPages())
            <div class="card-footer">{{ $customers->links() }}</div>
        @endif
    </div>
</div>
