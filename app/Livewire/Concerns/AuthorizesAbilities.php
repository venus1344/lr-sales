<?php

namespace App\Livewire\Concerns;

use Illuminate\Auth\Access\AuthorizationException;

trait AuthorizesAbilities
{
    /**
     * Abort unless the authenticated user holds the given ability.
     *
     * Super admins bypass. Throws AuthorizationException (mapped to 403) so
     * Livewire component tests can assert forbidden responses.
     */
    protected function authorizeAbility(string $ability): void
    {
        if (! auth()->user()?->hasAbility($ability)) {
            throw new AuthorizationException('You do not have permission to perform this action.');
        }
    }
}
