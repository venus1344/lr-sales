<div>
    <div class="row mb-3">
        <div class="col-md-6">
            <input type="search" wire:model.live="search" class="form-control" placeholder="Search items...">
        </div>
        <div class="col-md-6 text-end">
            <button wire:click="create" class="btn btn-primary">
                <i class="fa-solid fa-plus me-1"></i>New item
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
            <div class="card-header">{{ $itemId ? 'Edit item' : 'New item' }}</div>
            <div class="card-body">
                <form wire:submit.prevent="{{ $itemId ? 'update' : 'store' }}">
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label class="form-label" for="category_id">Category</label>
                            <select wire:model="category_id" id="category_id"
                                    class="form-select @error('category_id') is-invalid @enderror">
                                <option value="">Select category</option>
                                @foreach ($categories as $category)
                                    <option value="{{ $category->id }}">{{ $category->name }}</option>
                                @endforeach
                            </select>
                            @error('category_id')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label" for="name">Name</label>
                            <input type="text" wire:model="name" id="name"
                                   class="form-control @error('name') is-invalid @enderror">
                            @error('name')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label" for="unit_measure">Unit of measure</label>
                            <input type="text" wire:model="unit_measure" id="unit_measure"
                                   class="form-control @error('unit_measure') is-invalid @enderror" placeholder="pcs">
                            @error('unit_measure')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label" for="price">Price</label>
                            <input type="number" step="0.01" wire:model="price" id="price"
                                   class="form-control @error('price') is-invalid @enderror">
                            @error('price')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-8 mb-3">
                            <label class="form-label" for="specification">Specification</label>
                            <textarea wire:model="specification" id="specification" rows="2"
                                      class="form-control @error('specification') is-invalid @enderror"></textarea>
                            @error('specification')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>
                    <div class="form-check form-check-inline mb-3">
                        <input type="checkbox" wire:model="vat" class="form-check-input" id="vat">
                        <label class="form-check-label" for="vat">VAT applicable</label>
                    </div>
                    <div class="form-check form-check-inline mb-3">
                        <input type="checkbox" wire:model="active" class="form-check-input" id="active">
                        <label class="form-check-label" for="active">Active</label>
                    </div>
                    <div class="mt-2">
                        <button type="submit" class="btn btn-success">
                            <i class="fa-solid fa-save me-1"></i>Save
                        </button>
                        <button type="button" wire:click="cancel" class="btn btn-secondary">Cancel</button>
                    </div>
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
                        <th>Category</th>
                        <th>Unit</th>
                        <th class="text-end">Price</th>
                        <th>VAT</th>
                        <th>Status</th>
                        <th class="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($items as $item)
                        <tr>
                            <td>{{ $item->name }}</td>
                            <td>{{ $item->category?->name }}</td>
                            <td>{{ $item->unit_measure }}</td>
                            <td class="text-end">{{ $item->price }}</td>
                            <td>{{ $item->vat ? 'Yes' : 'No' }}</td>
                            <td>
                                <span class="badge {{ $item->active ? 'text-bg-success' : 'text-bg-secondary' }}">
                                    {{ $item->active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="text-end">
                                <button wire:click="edit({{ $item->id }})" class="btn btn-sm btn-outline-primary">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button wire:click="delete({{ $item->id }})"
                                        wire:confirm="Delete this item?"
                                        class="btn btn-sm btn-outline-danger">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center text-muted py-3">No items found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if ($items->hasPages())
            <div class="card-footer">{{ $items->links() }}</div>
        @endif
    </div>
</div>
