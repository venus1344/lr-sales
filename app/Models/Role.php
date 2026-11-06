<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = ['created_by', 'updated_by', 'name', 'description', 'label'];

    /**
     * The abilities granted to this role.
     */
    public function abilities(): BelongsToMany
    {
        return $this->belongsToMany(Ability::class)
            ->withPivot('created_by')
            ->withTimestamps();
    }

    /**
     * The users that hold this role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('created_by')
            ->withTimestamps();
    }
}
