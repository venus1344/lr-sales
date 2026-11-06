<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasAbility
{
    /**
     * Abort unless the authenticated user holds the given ability.
     *
     * Super admins bypass the check. Pass the ability name as a route
     * middleware parameter, e.g. `ability:invoice_store`.
     */
    public function handle(Request $request, Closure $next, string $ability): Response
    {
        $user = $request->user();

        if (! $user || ! $user->hasAbility($ability)) {
            abort(403, 'You do not have permission to perform this action.');
        }

        return $next($request);
    }
}
