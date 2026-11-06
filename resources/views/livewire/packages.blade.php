<div>
    <div class="row mb-3">
        <div class="col-md-6">
            <input type="search" wire:model.live="search" class="form-control" placeholder="Search packages...">
        </div>
        <div class="col-md-6 text-end">
            <button wire:click="create" class="btn btn-primary">
                <i class="fa-solid fa-plus me-1"></i>New package
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
            <div class="card-header">{{ $packageId ? 'Edit package' : 'New package' }}</div>
            <div class="card-body">
                <form wire:submit.prevent="{{ $packageId ? 'update' : 'store' }}">
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label class="form-label" for="name">Name</label>
                            <input type="text" wire:model="name" id="name"
                                   class="form-control @error('name') is-invalid @enderror">
                            @error('name')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label" for="price">Price</label>
                            <input type="number" step="0.01" wire:model="price" id="price"
                                   class="form-control @error('price') is-invalid @enderror">
                            @error('price')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-4 mb-3 d-flex align-items-end">
                            <div class="form-check">
                                <input type="checkbox" wire:model="status" class="form-check-input" id="status">
                                <label class="form-check-label" for="status">Active</label>
                            </div>
                        </div>
                        <div class="col-12 mb-3">
                            <label class="form-label" for="description">Description</label>
                            <textarea wire:model="description" id="description" rows="2"
                                      class="form-control @error('description') is-invalid @enderror"></textarea>
                            @error('description')<div class="invalid-feedback">{{ $message }}</div>@enderror
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
                        <th>Name</th>
                        <th>Description</th>
                        <th class="text-end">Price</th>
                        <th>Status</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($packages as $package)
                        <tr>
                            <td>{{ $package->name }}</td>
                            <td>{{ $package->description }}</td>
                            <td class="text-end">{{ $package->price }}</td>
                            <td>
                                <span class="badge {{ $package->status ? 'text-bg-success' : 'text-bg-secondary' }}">
                                    {{ $package->status ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="text-end">
                                <button wire:click="edit({{ $package->id }})" class="btn btn-sm btn-outline-primary">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button wire:click="delete({{ $package->id }})"
                                        wire:confirm="Delete this package?"
                                        class="btn btn-sm btn-outline-danger">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="text-center text-muted py-3">No packages found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if ($packages->hasPages())
            <div class="card-footer">{{ $packages->links() }}</div>
        @endif
    </div>
</div>
