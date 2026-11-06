<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'created_by',
        'updated_by',
        'name',
        'email',
        'password',
        'super',
        'active',
        'theme',
        'passport',
        'education',
        'location',
        'skills',
        'notes',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'super' => 'boolean',
            'active' => 'boolean',
        ];
    }

    /**
     * Whether this user bypasses all ability checks.
     */
    public function isSuper(): bool
    {
        return (bool) $this->super;
    }

    /**
     * The roles assigned to this user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)
            ->withPivot('created_by')
            ->withTimestamps();
    }

    /**
     * The distinct ability names granted through the user's roles.
     *
     * Convenience accessor for display; callers should eager-load
     * `roles.abilities` to avoid N+1 queries.
     */
    public function abilities(): Collection
    {
        return $this->roles->map->abilities->flatten()->pluck('name')->unique();
    }

    /**
     * Whether the user holds the given ability (super admins bypass).
     */
    public function hasAbility(string $ability): bool
    {
        if ($this->isSuper()) {
            return true;
        }

        return $this->roles()
            ->whereHas('abilities', fn ($query) => $query->where('name', $ability))
            ->exists();
    }
}
